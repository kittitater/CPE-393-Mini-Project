from phe import paillier
import os
import pickle

KEY_FILE = "paillier_keys.pkl"

if os.path.exists(KEY_FILE):
    with open(KEY_FILE, "rb") as f:
        PAILLIER_PUBLIC_KEY, PAILLIER_PRIVATE_KEY = pickle.load(f)
else:
    PAILLIER_PUBLIC_KEY, PAILLIER_PRIVATE_KEY = paillier.generate_paillier_keypair(n_length=512)  # You can use 512 for dev
    with open(KEY_FILE, "wb") as f:
        pickle.dump((PAILLIER_PUBLIC_KEY, PAILLIER_PRIVATE_KEY), f)

class CryptoSettings:
    PAILLIER_PUBLIC_KEY = PAILLIER_PUBLIC_KEY
    PAILLIER_PRIVATE_KEY = PAILLIER_PRIVATE_KEY

crypto_settings = CryptoSettings()
