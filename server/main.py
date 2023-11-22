from typing import Union
from starlette.responses import RedirectResponse
from fastapi import FastAPI
import secrets
import urllib.parse
from dotenv import load_dotenv
import os

app = FastAPI()
load_dotenv('../.env.local')
client_id = os.getenv('SPOTIFY_CLIENT_ID')
client_secret = os.getenv('SPOTIFY_SECRET_KEY')


@app.get("/")
def read_root():
    return {"Hello": client_id}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.get("/login")
async def login():
    '''Redirects to Spotify login page'''
    redirect_uri = 'http://localhost:8000/login/callback'

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
    if state is None:
        raise HTTPException(status_code=400, detail="state_mismatch")

    if code:
        auth_header = base64.b64encode(f'{client_id}:{client_secret}'.encode()).decode()
        token_url = 'https://accounts.spotify.com/api/token'
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': f'Basic {auth_header}'
        }
        payload = {
            'code': code,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code'
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, headers=headers, data=payload)
            return response.json()

    raise HTTPException(status_code=400, detail="Invalid request")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)