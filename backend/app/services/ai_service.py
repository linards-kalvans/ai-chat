import os
import asyncio
from typing import AsyncGenerator
import openai

class AIService:
    def __init__(self):
        # Initialize OpenAI client
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key:
            self.openai_client = openai.OpenAI(api_key=openai_api_key)
        else:
            self.openai_client = None
        
        # Initialize xAI client using OpenAI-compatible interface
        xai_api_key = os.getenv("XAI_API_KEY")
        if xai_api_key:
            self.xai_client = openai.OpenAI(
                api_key=xai_api_key,
                base_url="https://api.x.ai/v1"  # xAI OpenAI-compatible endpoint
            )
        else:
            self.xai_client = None
    
    def get_response(self, message: str, provider: str = "openai", model: str = "gpt-3.5-turbo", think_mode: bool = False, deep_research_mode: bool = False) -> str:
        """Get a response from the AI service"""
        if provider.lower() == "openai":
            return self._get_openai_response(message, model, think_mode, deep_research_mode)
        elif provider.lower() == "xai":
            return self._get_xai_response(message, model, think_mode, deep_research_mode)
        else:
            raise ValueError(f"Unsupported provider: {provider}")
    
    def _get_openai_response(self, message: str, model: str, think_mode: bool, deep_research_mode: bool) -> str:
        """Get response from OpenAI"""
        if not os.getenv("OPENAI_API_KEY"):
            raise ValueError("OpenAI API key not configured")
        
        # Enhance prompt based on modes
        enhanced_message = message
        if think_mode:
            enhanced_message = f"Please think through this step by step: {message}"
        
        if deep_research_mode:
            enhanced_message = f"Please provide a comprehensive, well-researched response with detailed analysis: {message}"
        
        if think_mode and deep_research_mode:
            enhanced_message = f"Please think through this step by step and provide a comprehensive, well-researched response with detailed analysis: {message}"
        
        try:
            response = self.openai_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": enhanced_message}],
                max_tokens=4000 if deep_research_mode else 2000,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    def _get_xai_response(self, message: str, model: str, think_mode: bool, deep_research_mode: bool) -> str:
        """Get response from xAI"""
        if not os.getenv("XAI_API_KEY"):
            raise ValueError("xAI API key not configured")
        
        # Enhance prompt based on modes
        enhanced_message = message
        if think_mode:
            enhanced_message = f"Please think through this step by step: {message}"
        
        if deep_research_mode:
            enhanced_message = f"Please provide a comprehensive, well-researched response with detailed analysis: {message}"
        
        if think_mode and deep_research_mode:
            enhanced_message = f"Please think through this step by step and provide a comprehensive, well-researched response with detailed analysis: {message}"
        
        try:
            response = self.xai_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": enhanced_message}],
                max_tokens=4000 if deep_research_mode else 2000,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"xAI API error: {str(e)}")
    
    async def get_streaming_response(self, message: str, provider: str = "openai", model: str = "gpt-3.5-turbo", think_mode: bool = False, deep_research_mode: bool = False) -> AsyncGenerator[str, None]:
        """Get a streaming response from the AI service"""
        if provider.lower() == "openai":
            async for chunk in self._get_openai_streaming_response(message, model, think_mode, deep_research_mode):
                yield chunk
        elif provider.lower() == "xai":
            async for chunk in self._get_xai_streaming_response(message, model, think_mode, deep_research_mode):
                yield chunk
        else:
            raise ValueError(f"Unsupported provider: {provider}")
    
    async def _get_openai_streaming_response(self, message: str, model: str, think_mode: bool, deep_research_mode: bool) -> AsyncGenerator[str, None]:
        """Get streaming response from OpenAI"""
        if not os.getenv("OPENAI_API_KEY"):
            raise ValueError("OpenAI API key not configured")
        
        # Enhance prompt based on modes
        enhanced_message = message
        if think_mode:
            enhanced_message = f"Please think through this step by step: {message}"
        
        if deep_research_mode:
            enhanced_message = f"Please provide a comprehensive, well-researched response with detailed analysis: {message}"
        
        if think_mode and deep_research_mode:
            enhanced_message = f"Please think through this step by step and provide a comprehensive, well-researched response with detailed analysis: {message}"
        
        try:
            response = self.openai_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": enhanced_message}],
                max_tokens=4000 if deep_research_mode else 2000,
                temperature=0.7,
                stream=True
            )
            
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    # Add a small delay for realistic typing effect
                    await asyncio.sleep(0.05)
                    
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    async def _get_xai_streaming_response(self, message: str, model: str, think_mode: bool, deep_research_mode: bool) -> AsyncGenerator[str, None]:
        """Get streaming response from xAI"""
        if not os.getenv("XAI_API_KEY"):
            raise ValueError("xAI API key not configured")
        
        # Enhance prompt based on modes
        enhanced_message = message
        if think_mode:
            enhanced_message = f"Please think through this step by step: {message}"
        
        if deep_research_mode:
            enhanced_message = f"Please provide a comprehensive, well-researched response with detailed analysis: {message}"
        
        if think_mode and deep_research_mode:
            enhanced_message = f"Please think through this step by step and provide a comprehensive, well-researched response with detailed analysis: {message}"
        
        try:
            response = self.xai_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": enhanced_message}],
                max_tokens=4000 if deep_research_mode else 2000,
                temperature=0.7,
                stream=True
            )
            
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    await asyncio.sleep(0.05)
                    
        except Exception as e:
            raise Exception(f"xAI API error: {str(e)}")

# Global instance
ai_service = AIService() 