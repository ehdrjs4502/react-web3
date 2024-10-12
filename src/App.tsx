import React, { useState, useEffect } from "react";
import Web3 from "web3";

function App() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | Uint8Array>("");

  // MetaMask와 Web3 연결
  useEffect(() => {
    const connectMetaMask = async () => {
      if (window.ethereum) {
        try {
          // Web3 인스턴스 생성 및 상태 저장
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          // MetaMask 계정 요청
          const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          // 해당 계정의 잔액 가져오기 및 Wei를 Ether로 변환
          const balanceInWei = await web3Instance.eth.getBalance(accounts[0]);
          const balanceInEther = web3Instance.utils.fromWei(balanceInWei, "ether");
          setBalance(balanceInEther);
        } catch (error) {
          // MetaMask 계정 요청 또는 잔액 가져오는 중 오류 처리
          console.error("MetaMask 계정 또는 잔액을 가져오는 중 오류 발생:", error);
        }
      } else {
        // MetaMask가 설치되어 있지 않을 경우 처리
        console.error("MetaMask가 설치되지 않았습니다.");
        window.open("https://metamask.io/download.html");
      }
    };

    // 비동기 함수 호출
    connectMetaMask();
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
      // 트랜잭션 후 잔액 업데이트
      const newBalance = await web3.eth.getBalance(account);
      setBalance(web3.utils.fromWei(newBalance, "ether"));
      setIsLoading(false); // 트랜잭션 완료 후 로딩 상태 해제
    } catch (error) {
      console.error("이더리움 전송 중 오류 발생:", error);
      setIsLoading(false); // 오류 발생 시 로딩 상태 해제
    }
  };

  return (
    <div>
      <h1>MetaMask로 이더리움 전송</h1>
      {account ? (
        <>
          <p>연결된 계정: {account}</p>
          <p>잔액: {balance.substring(0, 6)} ETH</p> {/* 잔액 표시 */}
        </>
      ) : (
        <p>MetaMask를 연결하세요</p>
      )}

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

      <br />
      <br />
      <p>최효현 교수님 지갑 주소: 0x95319d1e6Fff1667CdC4fcDDfedAf852dec78A7b</p>
      <p>내 지갑 주소: 0x2c879C9Fc9399024E3FD17e5cF6ccd02Bb6f0dD0</p>
    </div>
  );
}

export default App;
