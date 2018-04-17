pragma solidity ^ 0.4.6;

import './Ownable.sol';

contract DocAuth is Ownable {

  struct DocumentData {
    bytes32 recordHash;
    bytes32 authorName;
    bytes32 title;
    bytes32 email;
    uint timestamp;
    bool isDocExists;
  }
  
  struct Author {
      bytes32[] documentId;
  }

  mapping(bytes32 => DocumentData) public documentdata;
  mapping(bytes32 => Author)  author;

  event _NewDocAuth(bytes32 indexed recordHash, bytes32 authorName, bytes32 title, bytes32 email, uint256 timestamp, bool isDocExists);

  function authNewDoc(bytes32 recordHash, bytes32 authorName, bytes32 title, bytes32 email) external {

    require(recordHash != "");

    var docdata = documentdata[recordHash];
    docdata.recordHash = recordHash;
    docdata.authorName = authorName;
    docdata.title = title;
    docdata.email = email;
    docdata.timestamp = block.timestamp;
    docdata.isDocExists = true;

    var authorStruct = author[authorName];
    authorStruct.documentId.push(recordHash);

    _NewDocAuth(recordHash, authorName, title, email, block.timestamp, true);
  }


  function exists(bytes32 record) view public returns(bool) {
    return documentdata[record].isDocExists;
  }

  function getDocDetailFromHash(bytes32 record) view public returns ( bytes32,bytes32,bytes32,uint256) {
    return  ( documentdata[record].authorName , documentdata[record].title, documentdata[record].email, documentdata[record].timestamp );
  }

  function getDocDetailFromAuthorName(bytes32 authorName) view public returns(bytes32[]) {
   var authorStruct = author[authorName];
   var documentIdArray = authorStruct.documentId;
    return (documentIdArray);
  }
}