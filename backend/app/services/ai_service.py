import httpx
import openai
from typing import List, Dict, Any
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        self.openai_client = None
        if settings.openai_api_key and settings.openai_api_key != "your_openai_api_key_here":
            self.openai_client = openai.OpenAI(api_key=settings.openai_api_key)
    
    async def chat_with_openai(self, messages: List[Dict[str, str]], model: str = "gpt-3.5-turbo", thinking_mode: bool = False, deep_research_mode: bool = False) -> str:
        """Chat with OpenAI models"""
        if not self.openai_client:
            raise ValueError("OpenAI API key not configured or invalid")
        
        # Adjust parameters based on modes
        max_tokens = 2000 if deep_research_mode else 1000
        temperature = 0.3 if thinking_mode else 0.7
        
        try:
            response = self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        except openai.AuthenticationError:
            raise Exception("OpenAI API authentication failed. Please check your API key.")
        except openai.RateLimitError:
            raise Exception("OpenAI API rate limit exceeded. Please try again later.")
        except openai.APIError as e:
            raise Exception(f"OpenAI API error: {str(e)}")
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    async def chat_with_xai(self, messages: List[Dict[str, str]], model: str = "grok-3", thinking_mode: bool = False, deep_research_mode: bool = False) -> str:
        """Chat with xAI models"""
        if not settings.xai_api_key or settings.xai_api_key == "your_xai_api_key_here":
            raise ValueError("xAI API key not configured or invalid")
        
        # xAI API endpoint
        url = "https://api.x.ai/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {settings.xai_api_key}",
            "Content-Type": "application/json"
        }
        
        # Adjust parameters based on modes
        max_tokens = 2000 if deep_research_mode else 1000
        temperature = 0.3 if thinking_mode else 0.7
        
        # Base data structure
        data = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        # Grok-4 is a reasoning model with different requirements
        if model == "grok-4-0709":
            # Remove parameters not supported by reasoning models
            # presencePenalty, frequencyPenalty, and stop are not supported
            # reasoning_effort parameter is not available for Grok-4
            pass
        else:
            # For Grok-3 and Grok-3-mini, we can add additional parameters if needed
            # These models support presencePenalty, frequencyPenalty, stop, and reasoning_effort
            pass
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                logger.info(f"Making xAI API request to {url} with model {model}")
                response = await client.post(url, headers=headers, json=data)
                logger.info(f"xAI API response status: {response.status_code}")
                response.raise_for_status()
                result = response.json()
                logger.info(f"xAI API response received successfully")
                return result["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                raise Exception("xAI API authentication failed. Please check your API key.")
            elif e.response.status_code == 429:
                raise Exception("xAI API rate limit exceeded. Please try again later.")
            else:
                logger.error(f"xAI API HTTP error: {e.response.status_code} - {e.response.text}")
                raise Exception(f"xAI API error (HTTP {e.response.status_code}): {e.response.text}")
        except httpx.RequestError as e:
            logger.error(f"xAI API request error: {str(e)}")
            raise Exception(f"xAI API request failed: {str(e)}")
        except Exception as e:
            logger.error(f"xAI API unexpected error: {str(e)}")
            raise Exception(f"xAI API error: {str(e)}")
    
    async def chat(self, messages: List[Dict[str, str]], provider: str, model: str, thinking_mode: bool = False, deep_research_mode: bool = False) -> str:
        """Main chat method that routes to appropriate provider"""
        if provider.lower() == "openai":
            return await self.chat_with_openai(messages, model, thinking_mode, deep_research_mode)
        elif provider.lower() == "xai":
            return await self.chat_with_xai(messages, model, thinking_mode, deep_research_mode)
        else:
            raise ValueError(f"Unsupported provider: {provider}")


ai_service = AIService() 