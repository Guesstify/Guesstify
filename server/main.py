from typing import Union
from fastapi import FastAPI, Request, Response, HTTPException, Header, Depends, Cookie
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
import utilities
import requests
import time
import os
from datetime import datetime, timedelta

app = FastAPI()
load_dotenv(".env.local")
client_id = os.getenv("SPOTIFY_CLIENT_ID")
client_secret = os.getenv("SPOTIFY_SECRET_KEY")
front_end_url = os.getenv("FRONTEND_URL")
backend_url = os.getenv("NEXT_PUBLIC_BACKEND_URL")
redirect_uri = f"{backend_url}/login/callback"
server_cookie = ""
mongodb_password = os.getenv("MONGO_DB_PASSWORD")
mongodb_user = os.getenv("MONGO_DB_USER")


# MongoDB CODE
# from pymongo.mongo_client import MongoClient

# MONGO_DB_USER = os.getenv("MONGO_DB_USER")
# MONGO_DB_PASSWORD = os.getenv("MONGO_DB_PASSWORD")
# uri = f"mongodb+srv://{MONGO_DB_USER}:{MONGO_DB_PASSWORD}@primary.okiuys9.mongodb.net/?retryWrites=true&w=majority"
# # Create a new client and connect to the server
# client = MongoClient(uri)
# # Send a ping to confirm a successful connection
# try:
#     client.admin.command("ping")
#     print("Pinged your deployment. You successfully connected to MongoDB!")
# except Exception as e:
#     print(e)

origins = [
    "https://www.guesstify.app",
    "https://guesstify-git-main-guesstify.vercel.app",
    "https://guesstify-mtk8oipn2-guesstify.vercel.app",
    "https://guesstify.vercel.app",
    "http://localhost:3000",
]
# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
    expose_headers=["*"],
)


@app.get("/")
async def root():
    return "Stops"


@app.get("/get-cookie")
async def get_cookie(spotify_token: str = Cookie(None)):
    """Gets the Spotify token cookie."""
    print("cookie value: ", spotify_token)
    if spotify_token:
        return spotify_token
    else:
        raise HTTPException(status_code=400, detail="No cookie")


# Token data model
class TokenData(BaseModel):
    token: str


@app.post("/set-cookie")
async def set_cookie(response: Response, token_data: TokenData):
    """Sets the Spotify token cookie."""
    token = token_data.token
    # print(f"setting {token}")
    """Sets the Spotify token cookie."""
    cookie_expiration_time = 10800
    response.set_cookie(
        key="spotify_token", value=token, httponly=True, samesite="None", secure=True, max_age=cookie_expiration_time
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

    app_permissions = "playlist-modify-public user-read-private playlist-read-private user-read-email user-top-read user-modify-playback-state user-library-read playlist-modify-private"

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
    """Handles the callback from Spotify's OAuth service."""
    # Check if state is prdesent
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
                frontend_redirect_url = f"{front_end_url}/intro"
                response = RedirectResponse(url=frontend_redirect_url)
                print("response", response)
                print("callback", token_data["access_token"])
                ten_years = timedelta(days=365 * 10)
                expires = datetime.now() + ten_years
                response.set_cookie(
                    key="spotify_token",
                    value=token_data["access_token"],
                    expires=ten_years.total_seconds(),
                )
                return response
            else:
                raise HTTPException(
                    status_code=token_response.status_code,
                    detail="Failed to retrieve token",
                )

    # Handle cases where code is not present
    raise HTTPException(status_code=400, detail="Invalid request")

@app.get("/get_token")
async def user_info():
    session = requests.Session()
    print(session.cookies.get_dict())


@app.get("/user_info")
async def user_info(authorization: str = Header(None)):
    if authorization:
        # Extract the token from the authorization header
        # Assuming the header is in the format "Bearer <token>"
        token_type, _, token = authorization.partition(' ')
        if token_type.lower() != 'bearer' or not token:
            raise HTTPException(status_code=400, detail="Invalid authorization header format")

        # User info endpoint URL and Authorization Header
        user_info_url = "https://api.spotify.com/v1/me"
        user_info_header = {"Authorization": f"Bearer {token}"}

        async with httpx.AsyncClient() as client:
            # Get user info by sending a GET request to the user info endpoint on Spotify
            user_info_response = await client.get(user_info_url, headers=user_info_header)
            if user_info_response.status_code == 200:
                return user_info_response.json()
            else:
                raise HTTPException(
                    status_code=user_info_response.status_code,
                    detail="Failed to retrieve user info",
                )
    else:
        raise HTTPException(status_code=400, detail="Authorization header not found")


# Get user's top 50 tracks, included limit and offset parameters to make it easily customizable on front end


@app.get("/user_top_tracks")
async def user_top_tracks(request: Request, limit: int = 50, offset: int = 0):
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

            return utilities.form_track_list(response.json())
    else:
        raise HTTPException(status_code=400, detail="No cookie")

@app.get("/user_top_artists")
async def user_top_tracks(request: Request, limit: int = 18, offset: int = 0):
    """Gets the user's top 24 artists."""
    token = request.cookies.get("spotify_token")
    
    if token:
        url = "https://api.spotify.com/v1/me/top/artists"
        headers = {"Authorization": f"Bearer {token}"}
        params = {"time_range": "medium_term", "limit": limit, "offset": offset}
        startTime = time.time()
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params)


            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, detail=response.json()
                )
            fetchTime = time.time()
            returnVal = utilities.form_artist_list(response.json())
            dataProcessTime = time.time()
            print("fetch time: ", fetchTime - startTime)
            print("data processing time: ", dataProcessTime - fetchTime)
            return returnVal
    else:
        raise HTTPException(status_code=400, detail="No cookie")


@app.get("/recommend_songs")
async def recommend_songs(request:Request, limit: int = 10, market: str = "US"):
    # uses user listening history and chosen genre to recommend 10 songs
    token = request.cookies.get("spotify_token")
    seed_genres = request.query_params.get("seed_genres").lower()
    target_popularity = request.query_params.get("popularity")

    print(seed_genres)

    if not seed_genres:
        return HTTPException(status_code=500, detail="no_genre")
    
    if token:
        url = "https://api.spotify.com/v1/recommendations"
        headers = {"Authorization": f"Bearer {token}"}
        params = {"seed_genres": seed_genres, "limit": limit, "market": market, 
                   "target_popularity": target_popularity,}

        print(params)

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params)

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, detail=response.json()
                )

            return utilities.recommend_songs(response.json())
    else:
        raise HTTPException(status_code=400, detail="No cookie")

#need to lowercase all chars in genre string
# for static usage: my top seeds artists are: 4SpbR6yFEvexJuaBpgAU5p,3TVXtAsR1Inumwj472S9r4,06HL4z0CvFAxyc27GXpf02,5K4W6rqBFWDnAN6FQUkS6x,6USv9qhCn6zfxlBQIYJ9qs
# for static usage: my top seed tracks are: 7dJYggqjKo71KI9sLzqCs8,14mmDeJOYO6feKPLrdU2li,1aAKe7L1OKsoXJHqy8uMwH,2PspwQLfDzLUOyaxQ7de5L,0THW04vlFAkfflASMFam0t

@app.get("/artist_top_tracks")
async def recommend_songs(request:Request, market: str = "US"):
    # uses user listening history and chosen genre to recommend 10 songs
    token = request.cookies.get("spotify_token")
    artist_id = request.query_params.get("artist_id")
    
    if token:
        url = f"https://api.spotify.com/v1/artists/{artist_id}/top-tracks"
        headers = {"Authorization": f"Bearer {token}"}
        params = {"market": market}

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params)

            if response.status_code != 200:
                print("issue here")
                raise HTTPException(
                    status_code=response.status_code, detail=response.json()
                )

            returnVal= utilities.artist_fetch_info(response.json())
            print(returnVal)
            return returnVal
    else:
        raise HTTPException(status_code=400, detail="No cookie")


@app.get("/user_playlists")
async def user_playlists(request:Request):
    # uses user listening history and chosen genre to recommend 10 songs
    token = request.cookies.get("spotify_token")

    offset = request.query_params.get("offset")
    limit = request.query_params.get("limit")

    start_time = time.time()

    
    if token:
        url = f"https://api.spotify.com/v1/me/playlists?limit={limit}&offset={offset}"
        headers = {"Authorization": f"Bearer {token}"}


        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)

            if response.status_code != 200:
                print("issue here")
                raise HTTPException(
                    status_code=response.status_code, detail=response.json()
                )

            returnVal= utilities.form_playlist_list(response.json())
            end_time = time.time()
            print("offset ", offset)
            print(f"started at: {start_time}    ended at: {end_time}")
            print()
            return returnVal
    else:
        raise HTTPException(status_code=400, detail="No cookie")

@app.get("/playlist_items")
async def playlist_items(request:Request):
    # uses user listening history and chosen genre to recommend 10 songs
    token = request.cookies.get("spotify_token")

    offset = request.query_params.get("offset")
    limit = request.query_params.get("limit")
    playlist_id = request.query_params.get("id")

    print("playlist_id: ", playlist_id)

    if token:
        url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks?offset={offset}&limit=100&market=US&locale=en-US,en;q%3D0.9"
        headers = {"Authorization": f"Bearer {token}"}


        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)

            if response.status_code != 200:
                print("issue here")
                raise HTTPException(
                    status_code=response.status_code, detail=response.json()
                )

            returnVal= utilities.get_playlist_items(response.json(), offset)
            return returnVal
    else:
        raise HTTPException(status_code=400, detail="No cookie")


@app.post("/create_playlist")
async def create_playlist(request:Request):
    # uses user listening history and chosen genre to recommend 10 songs
    token = request.cookies.get("spotify_token")
    playlist_name = request.query_params.get("playlist_name")
    username = request.query_params.get("username")


    if token:
        url = f"https://api.spotify.com/v1/users/{username}/playlists"
        headers = {"Authorization": f"Bearer {token}",
                   "Content-Type": "application/json"
        }
        payload = {
            "name": playlist_name,
            "public": True,
            "description": "Spotify vinyls generated"
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, data=json.dumps(payload))

            if response.status_code != 201:
                print("issue here")
                raise HTTPException(
                    status_code=response.status_code, detail=response.json()
                )

        
            returnVal= response.json()["id"]
            print(returnVal)
            return returnVal
    else:
        raise HTTPException(status_code=400, detail="No cookie")

@app.post("/store_game")
def store_game(request: Request):
    pass


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", default=8000)),
        log_level="info",
    )
