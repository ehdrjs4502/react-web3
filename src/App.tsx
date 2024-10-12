import React, { useState, useEffect } from "react";
import Web3 from "web3";

function App() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | Uint8Array>("");

  // MetaMask와 Web3 연결
  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      // MetaMask 계정 요청
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts: string[]) => {
          setAccount(accounts[0]);
        })
        .catch((error: Error) => {
          console.error("MetaMask 계정을 가져오는 중 오류 발생:", error);
        });
    } else {
      console.error("MetaMask가 설치되지 않았습니다.");
      window.open("https://metamask.io/download.html");
    }
  }, []);

  // 이더리움 전송 함수
  const sendEther = async () => {
    if (!web3) {
      alert("MetaMask가 연결되지 않았습니다.");
      return;
    }

    setIsLoading(true); // 전송 시작 시 로딩 상태 설정

    try {
      const transaction = {
        from: account!,
        to: recipient,
        value: web3.utils.toWei(amount, "ether"), // 이더를 Wei 단위로 변환
        gas: 21000, // 기본 가스 한도
      };

      const hash = await web3.eth.sendTransaction(transaction);
      setTransactionHash(hash.transactionHash); // 트랜잭션 해시 저장
      setIsLoading(false); // 트랜잭션 완료 후 로딩 상태 해제
    } catch (error) {
      console.error("이더리움 전송 중 오류 발생:", error);
      setIsLoading(false); // 오류 발생 시 로딩 상태 해제
    }
  };

  return (
    <div>
      <h1>MetaMask로 이더리움 전송</h1>
      {account ? <p>연결된 계정: {account}</p> : <p>MetaMask를 연결하세요</p>}

      <div>
        <label>받는 주소: </label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          disabled={isLoading} // 로딩 중일 때 입력 불가
        />
      </div>

      <div>
        <label>보낼 이더: </label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="ETH"
          disabled={isLoading} // 로딩 중일 때 입력 불가
        />
      </div>
      <br />
      <button onClick={sendEther} disabled={isLoading}>
        {isLoading ? "전송 중..." : "이더리움 전송"}
      </button>
      <br />
      {transactionHash && <p>트랜잭션 해시: {transactionHash}</p>}
    </div>
  );
}

export default App;
