from typing import Union
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import RedirectResponse
from fastapi import FastAPI
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
import utilities

app = FastAPI()
load_dotenv("../.env.local")
client_id = os.getenv("SPOTIFY_CLIENT_ID")
client_secret = os.getenv("SPOTIFY_SECRET_KEY")
redirect_uri = "http://localhost:8000/login/callback"


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
    """Gets the Spotify token cookie."""
    token = request.cookies.get("spotify_token")
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
    """Sets the Spotify token cookie."""
    token = token_data.token
    print(f"setting {token}")
    """Sets the Spotify token cookie."""
    response.set_cookie(
        key="spotify_token", value=token, httponly=True, samesite="None", secure=True
    )


@app.post("/delete-cookie")
async def delete_cookie(response: Response):
    """Deletes the Spotify token cookie."""
    response.delete_cookie(key="spotify_token")


@app.get("/login")
async def login():
    """Redirects to Spotify login page"""

    # Generate a random string for the state parameter
    state = secrets.token_urlsafe(16)

    app_permissions = "user-read-private user-read-email user-top-read user-modify-playback-state user-library-read"

    query_params = {
        "response_type": "code",
        "client_id": client_id,
        "scope": app_permissions,
        "redirect_uri": redirect_uri,
        "state": state,
    }

    query_string = urllib.parse.urlencode(query_params)
    auth_url = f"https://accounts.spotify.com/authorize?{query_string}"

    return RedirectResponse(url=auth_url)


@app.get("/login/callback")
async def callback(code: str = None, state: str = None):
    # Check if state is present
    if state is None:
        raise HTTPException(status_code=400, detail="state_mismatch")

    # Check if the authorization code is present
    if code:
        # Encode the client ID and secret to Base64 for the Authorization header
        auth_header = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()

        # Spotify token endpoint
        token_url = "https://accounts.spotify.com/api/token"

        # Headers for the token request
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {auth_header}",
        }

        # Body of the token request
        payload = {
            "code": code,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }

        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, headers=headers, data=payload)

            if token_response.status_code == 200:
                token_data = token_response.json()
                token_query = urllib.parse.urlencode(token_data)

                # Redirect URL for your frontend, must return cookie as part of the response
                frontend_redirect_url = (
                    f"http://localhost:3000/home?token={token_query}"
                )
                response = RedirectResponse(url=frontend_redirect_url)
                response.set_cookie(
                    key="spotify_token",
                    value=token_data["access_token"],
                    httponly=True,
                    samesite="Lax",
                )
                return response
            else:
                raise HTTPException(
                    status_code=token_response.status_code,
                    detail="Failed to retrieve token",
                )

        raise HTTPException(status_code=400, detail="Invalid request")

    # Handle cases where code is not present
    raise HTTPException(status_code=400, detail="Invalid request")


@app.get("/user_info")
async def user_info(request: Request):
    token = request.cookies.get("spotify_token")
    print("get /user_info", token)
    if token:
        # User info endpoint URL and Authorization Header
        user_info_url = "https://api.spotify.com/v1/me"
        user_info_header = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient() as client:
            # Get user info by sending a GET request to the user info endpoint on Spotify
            user_info_response = await client.get(
                user_info_url, headers=user_info_header
            )
            if user_info_response.status_code == 200:
                return user_info_response.json()
            else:
                raise HTTPException(
                    status_code=user_info_response.status_code,
                    detail="Failed to retrieve user info",
                )
    else:
        raise HTTPException(status_code=400, detail="No cookie")


# Get user's top 50 tracks, included limit and offset parameters to make it easily customizable on front end


@app.get("/user_top_tracks")
async def user_top_tracks(request: Request, limit: int = 100, offset: int = 5):
    """Gets the user's top 50 tracks."""
    token = request.cookies.get("spotify_token")
    if token:
        url = "https://api.spotify.com/v1/me/top/tracks"
        headers = {"Authorization": f"Bearer {token}"}
        params = {"time_range": "short_term", "limit": limit, "offset": offset}

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params)

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, detail=response.json()
                )
                        
            return utilities.form_list(response.json())
    else:
        raise HTTPException(status_code=400, detail="No cookie")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
