from typing import Union
from starlette.responses import RedirectResponse
from fastapi import FastAPI, Request, Response, HTTPException
import secrets
import urllib.parse
from dotenv import load_dotenv
import os
import base64
import httpx
import json
from authentication.spotify_token_cookie import set_cookie
from authentication.spotify_token_cookie import parse_token_query
from starlette.middleware.cors import CORSMiddleware as CORSMiddleware
from pydantic import BaseModel
from starlette.responses import HTMLResponse

app = FastAPI()
load_dotenv('../.env.local')
client_id = os.getenv('SPOTIFY_CLIENT_ID')
client_secret = os.getenv('SPOTIFY_SECRET_KEY')
redirect_uri = 'http://localhost:8000/login/callback'


# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/get-cookie")
async def get_cookie(request: Request):
    token = request.cookies.get('spotify_token')
    print(token)
    if token:
        return token
    else:
        raise HTTPException(status_code=400, detail="No cookie")


# Token data model
class TokenData(BaseModel):
    token: str


@app.post("/set-cookie")
async def set_cookie(response: Response, token_data: TokenData):
    token = token_data.token
    print(token)
    """Sets the Spotify token cookie."""
    response.set_cookie(key='spotify_token', value=token,
                        httponly=True, samesite='None', secure=True)


@app.get("/")
def read_root():
    return {"Hello": client_id}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.get("/login")
async def login():
    '''Redirects to Spotify login page'''

    # Generate a random string for the state parameter
    state = secrets.token_urlsafe(16)

    app_permissions = 'user-read-private user-read-email'

    query_params = {
        "response_type": "code",
        "client_id": client_id,
        "scope": app_permissions,
        "redirect_uri": redirect_uri,
        "state": state
    }

    query_string = urllib.parse.urlencode(query_params)
    auth_url = f'https://accounts.spotify.com/authorize?{query_string}'

    return RedirectResponse(url=auth_url)


@app.get("/login/callback")
async def callback(code: str = None, state: str = None):
    # Check if state is present
    if state is None:
        raise HTTPException(status_code=400, detail="state_mismatch")

    # Check if the authorization code is present
    if code:
        # Encode the client ID and secret to Base64 for the Authorization header
        auth_header = base64.b64encode(
            f'{client_id}:{client_secret}'.encode()).decode()

        # Spotify token endpoint
        token_url = 'https://accounts.spotify.com/api/token'

        # Headers for the token request
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': f'Basic {auth_header}'
        }

        # Body of the token request
        payload = {
            'code': code,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code'
        }

        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, headers=headers, data=payload)

            if token_response.status_code == 200:
                token_data = token_response.json()
                token_query = urllib.parse.urlencode(token_data)

                # Redirect URL for your frontend
                frontend_redirect_url = f'http://localhost:3000/game?token={token_query}'
                response = RedirectResponse(url=frontend_redirect_url)
                response.set_cookie(key='spotify_token', value=token_data['access_token'],
                                    httponly=True, samesite='Lax')
                return response
            else:
                raise HTTPException(
                    status_code=token_response.status_code, detail="Failed to retrieve token")

        raise HTTPException(status_code=400, detail="Invalid request")

    # Handle cases where code is not present
    raise HTTPException(status_code=400, detail="Invalid request")
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
