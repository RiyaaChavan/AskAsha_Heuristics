# generate_key.py
import secrets

def generate_secret_key():
    return secrets.token_hex(32)

if __name__ == "__main__":
    secret_key = generate_secret_key()
    print("\nYour JWT Secret Key:")
    print(secret_key)
    print("\nAdd this to your .env file as:")
    print(f"JWT_SECRET_KEY={secret_key}\n")