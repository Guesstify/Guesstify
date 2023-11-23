
def set_cookie(response, token):
    """Sets the Spotify token cookie."""

    response.set_cookie(key='spotify_token', value=token, httponly=True, samesite='None', secure=True)

def parse_token_query(token_query):
    """
    Parses the token query string and returns a JSON object with the token information.

    :param token_query: A string containing the token query.
    :return: A JSON object with the token information.
    """
    # Split the query string into key-value pairs
    pairs = token_query.split('&')
    token_info = {}

    # Parse each key-value pair and add to the token_info dictionary
    for pair in pairs:
        key, value = pair.split('=')
        token_info[key] = value

    return token_info