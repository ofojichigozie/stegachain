use sha2::{Digest, Sha256};

/// Returns the SHA-256 digest of `data` as 32 raw bytes.
///
/// Use this when passing the digest as `bytes32` to a Solidity smart contract.
pub fn sha256_bytes(data: &[u8]) -> Vec<u8> {
    Sha256::digest(data).to_vec()
}

/// Returns the SHA-256 digest of `data` as a 64-character lowercase hex string.
///
/// Use this for display, logging, or comparing with on-chain hex values.
pub fn sha256_hex(data: &[u8]) -> String {
    Sha256::digest(data)
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    // SHA-256("") is a well-known constant — good sanity anchor.
    const EMPTY_HASH: &str =
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

    #[test]
    fn empty_input_known_hash() {
        assert_eq!(sha256_hex(&[]), EMPTY_HASH);
    }

    #[test]
    fn bytes_and_hex_consistent() {
        let data = b"stegachain";
        let raw = sha256_bytes(data);
        let hex = sha256_hex(data);
        let expected: String = raw.iter().map(|b| format!("{b:02x}")).collect();
        assert_eq!(hex, expected);
    }

    #[test]
    fn output_lengths() {
        assert_eq!(sha256_bytes(b"x").len(), 32);
        assert_eq!(sha256_hex(b"x").len(), 64);
    }

    #[test]
    fn different_inputs_differ() {
        assert_ne!(sha256_hex(b"hello"), sha256_hex(b"world"));
    }

    #[test]
    fn deterministic() {
        assert_eq!(sha256_hex(b"abc"), sha256_hex(b"abc"));
    }
}
