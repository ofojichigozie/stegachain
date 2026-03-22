/// Number of bits reserved for the u32 payload-length header.
const HEADER_BITS: usize = 32;

/// Returns the maximum payload bytes that fit in a `width × height` image.
///
/// Only R, G, B channels are used (1 bit each); alpha is never touched.
/// The header consumes 32 bits, leaving the rest for payload.
pub fn capacity_bytes(width: u32, height: u32) -> u32 {
    let usable_bits = (width as usize) * (height as usize) * 3;
    if usable_bits <= HEADER_BITS {
        return 0;
    }
    ((usable_bits - HEADER_BITS) / 8) as u32
}

/// Embeds `payload` into raw RGBA bytes using 1-bit LSB steganography.
///
/// ## Protocol
/// - Channels used: R, G, B only — alpha is never modified.
/// - First 32 bits embedded: payload length as a big-endian u32 (the header).
/// - Remaining bits: payload bytes, MSB first within each byte.
/// - Each bit replaces only the LSB of its channel, so pixel values shift by
///   at most ±1 — visually imperceptible.
///
/// ## Arguments
/// - `rgba`    — flat RGBA byte array (`width × height × 4` bytes).
/// - `width`   — image width in pixels.
/// - `height`  — image height in pixels.
/// - `payload` — bytes to embed (typically AES-256-GCM ciphertext).
///
/// ## Returns
/// Modified RGBA bytes (same length as `rgba`).
///
/// ## Errors
/// Returns an error string if `payload` exceeds the image capacity.
pub fn embed(rgba: &[u8], width: u32, height: u32, payload: &[u8]) -> Result<Vec<u8>, String> {
    let max = capacity_bytes(width, height) as usize;
    if payload.len() > max {
        return Err(format!(
            "Payload ({} bytes) exceeds image capacity ({} bytes)",
            payload.len(),
            max
        ));
    }

    let mut out = rgba.to_vec();

    // Build a flat bit stream: [length header (32 bits)] || [payload bits]
    let header = (payload.len() as u32).to_be_bytes();
    let bit_stream = header
        .iter()
        .chain(payload.iter())
        .flat_map(|byte| (0..8u8).rev().map(move |i| (byte >> i) & 1));

    for (bit_index, bit) in bit_stream.enumerate() {
        let pixel   = bit_index / 3;
        let channel = bit_index % 3; // 0 = R, 1 = G, 2 = B
        let pos     = pixel * 4 + channel;
        out[pos] = (out[pos] & 0xFE) | bit;
    }

    Ok(out)
}

/// Extracts a payload previously embedded with [`embed`] from raw RGBA bytes.
///
/// Blind extraction — the original cover image is not required.
///
/// ## Arguments
/// - `rgba`   — flat RGBA byte array of the stego-image.
/// - `width`  — image width in pixels.
/// - `height` — image height in pixels.
///
/// ## Errors
/// Returns an error string if the image is too small for a header, or if the
/// decoded length exceeds the image capacity (not a valid stego-image).
pub fn extract(rgba: &[u8], width: u32, height: u32) -> Result<Vec<u8>, String> {
    let total_bits = (width as usize) * (height as usize) * 3;

    if total_bits < HEADER_BITS {
        return Err("Image too small to contain the 32-bit length header".into());
    }

    // Step 1 — read the 32-bit header to learn how many payload bytes follow.
    let payload_len = read_u32_header(rgba) as usize;

    // Step 2 — sanity-check against available capacity.
    if HEADER_BITS + payload_len * 8 > total_bits {
        return Err(
            "Decoded length exceeds image capacity — image has no valid StegaChain payload".into(),
        );
    }

    // Step 3 — extract payload bits.
    let mut payload = vec![0u8; payload_len];
    for byte_idx in 0..payload_len {
        let mut byte_val = 0u8;
        for bit_offset in 0..8usize {
            let bit_index = HEADER_BITS + byte_idx * 8 + bit_offset;
            let pixel     = bit_index / 3;
            let channel   = bit_index % 3;
            let pos       = pixel * 4 + channel;
            byte_val |= (rgba[pos] & 1) << (7 - bit_offset as u8);
        }
        payload[byte_idx] = byte_val;
    }

    Ok(payload)
}

// -----------------------------------------------------------------------------
// Private helpers
// -----------------------------------------------------------------------------

fn read_u32_header(rgba: &[u8]) -> u32 {
    let mut value = 0u32;
    for i in 0..HEADER_BITS {
        let pos = (i / 3) * 4 + (i % 3);
        value |= ((rgba[pos] & 1) as u32) << (31 - i as u32);
    }
    value
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    fn gray(pixels: usize) -> Vec<u8> { vec![128u8; pixels * 4] }

    /// Minimum pixels needed to embed `n` payload bytes.
    fn min_px(n: usize) -> usize { (HEADER_BITS + n * 8 + 2) / 3 }

    #[test]
    fn roundtrip_text() {
        let payload = b"Hello, StegaChain!";
        let px = min_px(payload.len()) + 10;
        let img = gray(px);
        let stego = embed(&img, px as u32, 1, payload).unwrap();
        assert_eq!(extract(&stego, px as u32, 1).unwrap(), payload);
    }

    #[test]
    fn roundtrip_binary() {
        let payload: Vec<u8> = (0u8..=255).collect();
        let px = min_px(payload.len()) + 100;
        let img = gray(px);
        let stego = embed(&img, px as u32, 1, &payload).unwrap();
        assert_eq!(extract(&stego, px as u32, 1).unwrap(), payload);
    }

    #[test]
    fn roundtrip_empty_payload() {
        let img = gray(50);
        let stego = embed(&img, 50, 1, b"").unwrap();
        assert_eq!(extract(&stego, 50, 1).unwrap().len(), 0);
    }

    #[test]
    fn pixel_delta_at_most_one() {
        let payload = b"lsb integrity check";
        let px = min_px(payload.len()) + 20;
        let img = gray(px);
        let stego = embed(&img, px as u32, 1, payload).unwrap();
        for (a, b) in img.iter().zip(stego.iter()) {
            assert!((*a as i16 - *b as i16).abs() <= 1);
        }
    }

    #[test]
    fn alpha_never_modified() {
        let payload = b"alpha safe";
        let px = min_px(payload.len()) + 10;
        let img = gray(px);
        let stego = embed(&img, px as u32, 1, payload).unwrap();
        for p in 0..px {
            assert_eq!(img[p * 4 + 3], stego[p * 4 + 3], "alpha changed at pixel {p}");
        }
    }

    #[test]
    fn oversized_payload_rejected() {
        let img = gray(5);
        assert!(embed(&img, 5, 1, &vec![0u8; 100]).is_err());
    }

    #[test]
    fn capacity_formula() {
        // 100×100 px × 3 ch = 30000 bits; minus 32 header bits = 29968 bits → 3746 bytes
        assert_eq!(capacity_bytes(100, 100), 3746);
    }

    #[test]
    fn clean_image_extracts_empty() {
        // All-even LSBs → length header = 0 → returns empty vec.
        let img: Vec<u8> = vec![128u8; 50 * 4]; // 128 = 0b10000000, LSB = 0
        assert_eq!(extract(&img, 50, 1).unwrap().len(), 0);
    }
}
