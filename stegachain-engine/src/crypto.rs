use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Key, Nonce,
};

/// Number of bytes in an AES-GCM nonce (96-bit / 12 bytes).
const NONCE_LEN: usize = 12;

/// Encrypts `plaintext` with AES-256-GCM using a 32-byte `key`.
///
/// A fresh random 96-bit nonce is generated on every call.
/// Returns `nonce (12 bytes) || ciphertext` as a single byte vector so the
/// receiver always has everything needed for decryption in one blob.
///
/// # Errors
/// Returns an error string if `key` is not exactly 32 bytes.
pub fn encrypt(key: &[u8], plaintext: &[u8]) -> Result<Vec<u8>, String> {
    if key.len() != 32 {
        return Err(format!(
            "Key must be exactly 32 bytes for AES-256-GCM, got {}",
            key.len()
        ));
    }

    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    let ciphertext = cipher
        .encrypt(&nonce, plaintext)
        .map_err(|e| format!("Encryption failed: {e}"))?;

    let mut out = nonce.to_vec(); // prepend nonce
    out.extend_from_slice(&ciphertext);
    Ok(out)
}

/// Decrypts a blob produced by [`encrypt`].
///
/// Expects `payload` to be exactly `nonce (12 bytes) || ciphertext`.
/// Returns the original plaintext on success.
///
/// # Errors
/// Returns an error string if the key is wrong size, the payload is too short,
/// or AES-GCM authentication fails (wrong key / corrupted data).
pub fn decrypt(key: &[u8], payload: &[u8]) -> Result<Vec<u8>, String> {
    if key.len() != 32 {
        return Err(format!(
            "Key must be exactly 32 bytes for AES-256-GCM, got {}",
            key.len()
        ));
    }
    if payload.len() < NONCE_LEN {
        return Err(format!(
            "Payload too short: need at least {NONCE_LEN} bytes for the nonce, got {}",
            payload.len()
        ));
    }

    let (nonce_bytes, ciphertext) = payload.split_at(NONCE_LEN);
    let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));
    let nonce = Nonce::from_slice(nonce_bytes);

    cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| "Decryption failed: wrong key or corrupted ciphertext".into())
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    fn key() -> Vec<u8> { vec![0x42u8; 32] }

    #[test]
    fn roundtrip_basic() {
        let pt = b"Hello, StegaChain!";
        let blob = encrypt(&key(), pt).unwrap();
        assert!(blob.len() > NONCE_LEN);
        assert_eq!(decrypt(&key(), &blob).unwrap(), pt);
    }

    #[test]
    fn roundtrip_empty_plaintext() {
        let blob = encrypt(&key(), b"").unwrap();
        assert_eq!(decrypt(&key(), &blob).unwrap(), b"");
    }

    #[test]
    fn ciphertext_differs_from_plaintext() {
        let pt = b"secret message!!";
        let blob = encrypt(&key(), pt).unwrap();
        assert_ne!(&blob[NONCE_LEN..NONCE_LEN + pt.len()], pt);
    }

    #[test]
    fn unique_nonce_per_call() {
        // Same key + same plaintext must produce different outputs every time.
        let p1 = encrypt(&key(), b"msg").unwrap();
        let p2 = encrypt(&key(), b"msg").unwrap();
        assert_ne!(p1, p2);
    }

    #[test]
    fn wrong_key_rejected() {
        let blob = encrypt(&key(), b"secret").unwrap();
        let bad = vec![0x00u8; 32];
        assert!(decrypt(&bad, &blob).is_err());
    }

    #[test]
    fn wrong_key_length_rejected() {
        assert!(encrypt(&vec![0u8; 16], b"data").is_err());
        assert!(decrypt(&vec![0u8; 16], b"data").is_err());
    }

    #[test]
    fn payload_too_short_rejected() {
        // Fewer bytes than a nonce — must not panic, must return Err.
        assert!(decrypt(&key(), &[0u8; 8]).is_err());
    }
}
