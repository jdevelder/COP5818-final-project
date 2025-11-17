// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TCGCardToken
 * @dev ERC721-like implementation for Trading Card Game cards
 * Each token represents a unique TCG card with specific attributes
 */
contract TCGCardToken {
    // Card metadata structure
    struct CardMetadata {
        string name;           // Card name (e.g., "Charizard", "Black Lotus")
        string cardSet;        // Set the card belongs to
        uint256 rarity;        // Rarity level (1-5, with 5 being mythic rare)
        uint256 condition;     // Condition grade (1-10, PSA-style grading)
        string imageURI;       // IPFS or URL to card image
        uint256 mintedAt;      // Timestamp of minting
    }

    // Token name and symbol
    string public name = "TCG Card Token";
    string public symbol = "TCGC";

    // Token ID counter
    uint256 private _tokenIdCounter;

    // Mapping from token ID to owner
    mapping(uint256 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Mapping from token ID to card metadata
    mapping(uint256 => CardMetadata) public cardMetadata;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event CardMinted(uint256 indexed tokenId, address indexed owner, string name, uint256 rarity);

    /**
     * @dev Mint a new TCG card
     * @param _to Address to mint the card to
     * @param _name Card name
     * @param _cardSet Card set
     * @param _rarity Rarity level (1-5)
     * @param _condition Condition grade (1-10)
     * @param _imageURI URI to card image
     * @return tokenId The ID of the newly minted card
     */
    function mintCard(
        address _to,
        string memory _name,
        string memory _cardSet,
        uint256 _rarity,
        uint256 _condition,
        string memory _imageURI
    ) public returns (uint256) {
        require(_to != address(0), "Cannot mint to zero address");
        require(_rarity >= 1 && _rarity <= 5, "Rarity must be between 1-5");
        require(_condition >= 1 && _condition <= 10, "Condition must be between 1-10");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _owners[tokenId] = _to;
        _balances[_to]++;

        cardMetadata[tokenId] = CardMetadata({
            name: _name,
            cardSet: _cardSet,
            rarity: _rarity,
            condition: _condition,
            imageURI: _imageURI,
            mintedAt: block.timestamp
        });

        emit Transfer(address(0), _to, tokenId);
        emit CardMinted(tokenId, _to, _name, _rarity);

        return tokenId;
    }

    /**
     * @dev Returns the owner of the token
     */
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token does not exist");
        return owner;
    }

    /**
     * @dev Returns the balance of an address
     */
    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "Query for zero address");
        return _balances[owner];
    }

    /**
     * @dev Transfer token from one address to another
     */
    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized");
        require(ownerOf(tokenId) == from, "From address is not owner");
        require(to != address(0), "Cannot transfer to zero address");

        // Clear approvals
        _tokenApprovals[tokenId] = address(0);

        _balances[from]--;
        _balances[to]++;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    /**
     * @dev Safe transfer (calls receiver if contract)
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        transferFrom(from, to, tokenId);
    }

    /**
     * @dev Approve an address to transfer a specific token
     */
    function approve(address to, uint256 tokenId) public {
        address owner = ownerOf(tokenId);
        require(to != owner, "Approval to current owner");
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender), "Not authorized");

        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    /**
     * @dev Get approved address for a token
     */
    function getApproved(uint256 tokenId) public view returns (address) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _tokenApprovals[tokenId];
    }

    /**
     * @dev Set approval for all tokens
     */
    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "Approve to caller");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    /**
     * @dev Check if operator is approved for all tokens of owner
     */
    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    /**
     * @dev Internal function to check if spender is approved or owner
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }

    /**
     * @dev Get card metadata
     */
    function getCardMetadata(uint256 tokenId) public view returns (
        string memory cardName,
        string memory cardSet,
        uint256 rarity,
        uint256 condition,
        string memory imageURI,
        uint256 mintedAt
    ) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        CardMetadata memory metadata = cardMetadata[tokenId];
        return (
            metadata.name,
            metadata.cardSet,
            metadata.rarity,
            metadata.condition,
            metadata.imageURI,
            metadata.mintedAt
        );
    }

    /**
     * @dev Get total supply of minted cards
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
