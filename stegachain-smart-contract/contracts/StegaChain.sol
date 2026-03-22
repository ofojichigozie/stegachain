// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title StegaChain
/// @notice On-chain hash registry for stego-images. Senders log the SHA-256
///         digest of a stego-image so receivers can independently verify its
///         integrity without trusting a central server.
contract StegaChain {
    struct Record {
        address sender;
        uint256 timestamp;
    }

    /// @notice Maps each image hash to its registration record.
    mapping(bytes32 => Record) public records;

    /// @notice Emitted when a new hash is registered.
    /// @param imageHash The SHA-256 digest of the stego-image (as bytes32).
    /// @param sender    The address that called logHash.
    /// @param timestamp The block timestamp at registration time.
    event HashLogged(
        bytes32 indexed imageHash,
        address indexed sender,
        uint256 timestamp
    );

    /// @notice Register the SHA-256 hash of a stego-image on-chain.
    /// @dev    Each hash can only be registered once to prevent replay attacks
    ///         and ensure a unique provenance record per image.
    /// @param imageHash The 32-byte SHA-256 digest of the stego-image.
    function logHash(bytes32 imageHash) external {
        require(imageHash != bytes32(0), "StegaChain: zero hash");
        require(
            records[imageHash].timestamp == 0,
            "StegaChain: hash already registered"
        );

        records[imageHash] = Record({
            sender: msg.sender,
            timestamp: block.timestamp
        });

        emit HashLogged(imageHash, msg.sender, block.timestamp);
    }

    /// @notice Query whether a hash is registered and return its provenance.
    /// @param imageHash The 32-byte SHA-256 digest to look up.
    /// @return found     True if the hash has been registered.
    /// @return sender    The address that registered the hash (zero if not found).
    /// @return timestamp The block timestamp at registration (zero if not found).
    function verify(bytes32 imageHash)
        external
        view
        returns (
            bool found,
            address sender,
            uint256 timestamp
        )
    {
        Record memory r = records[imageHash];
        found = r.timestamp != 0;
        sender = r.sender;
        timestamp = r.timestamp;
    }
}
