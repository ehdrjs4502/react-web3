import React, { useState, useEffect } from "react";
import Web3 from "web3";

const contractAddress = "0xE386373fCF1b9a5877508c873179ff4cC6AbAD41";
const contractABI = [
  {
    inputs: [{ internalType: "address payable", name: "_payee", type: "address" }],
    name: "sendPayment",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getPaymentHistory",
    outputs: [
      {
        components: [
          { internalType: "address", name: "payer", type: "address" },
          { internalType: "address", name: "payee", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
        ],
        internalType: "struct PaymentContract.Payment[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

function App() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentHistory, setPaymentHistory] = useState<
    { payer: string; payee: string; amount: string; timestamp: string }[]
  >([]);

  useEffect(() => {
    const connectMetaMask = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const balanceInWei = await web3Instance.eth.getBalance(accounts[0]);
          setBalance(web3Instance.utils.fromWei(balanceInWei, "ether"));
        } catch (error) {
          console.error("MetaMask 연결 오류:", error);
          setErrorMessage("MetaMask 연결 중 문제가 발생했습니다.");
        }
      } else {
        alert("MetaMask가 설치되어 있지 않습니다. 설치 후 다시 시도하세요.");
        window.open("https://metamask.io/download.html");
      }
    };

    connectMetaMask();
  }, []);

  const sendEther = async () => {
    if (!web3) {
      alert("MetaMask가 연결되지 않았습니다.");
      return;
    }

    if (!web3.utils.isAddress(recipient)) {
      alert("올바른 이더리움 주소를 입력하세요.");
      return;
    }

    if (parseFloat(amount) <= 0) {
      alert("보낼 금액은 0보다 커야 합니다.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const contract = new web3.eth.Contract(contractABI, contractAddress);

      const tx = await contract.methods.sendPayment(recipient).send({
        from: account,
        value: web3.utils.toWei(amount, "ether"),
      });

      setTransactionHash(tx.transactionHash);

      const newBalance = await web3.eth.getBalance(account);
      setBalance(web3.utils.fromWei(newBalance, "ether"));

      // 전송 후 결제 내역 업데이트
      await fetchPaymentHistory();
    } catch (error) {
      console.error("이더리움 전송 오류:", error);
      setErrorMessage("이더리움 전송 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    if (!web3) return;

    try {
      setIsLoading(true);
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      const history: any[] = await contract.methods.getPaymentHistory().call();
      if (!history || history.length === 0) {
        setPaymentHistory([]);
        return;
      }

      const formattedHistory = history.map((payment: any) => ({
        payer: payment.payer,
        payee: payment.payee,
        amount: web3.utils.fromWei(payment.amount, "ether"),
        timestamp: new Date(parseInt(payment.timestamp) * 1000).toLocaleString(),
      }));

      setPaymentHistory(formattedHistory);
    } catch (error) {
      console.error("결제 내역 조회 오류:", error);
      setErrorMessage("결제 내역 조회 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>MetaMask와 스마트 컨트랙트를 통한 이더리움 전송</h1>
      {account ? (
        <>
          <p>
            <strong>연결된 계정:</strong> {account}
          </p>
          <p>
            <strong>잔액:</strong> {parseFloat(balance).toFixed(4)} ETH
          </p>
        </>
      ) : (
        <p>MetaMask를 연결하세요</p>
      )}

      <div style={{ marginBottom: "10px" }}>
        <label>받는 주소:</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          style={{ width: "100%", padding: "8px", margin: "5px 0" }}
          disabled={isLoading}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>보낼 이더:</label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="ETH"
          style={{ width: "100%", padding: "8px", margin: "5px 0" }}
          disabled={isLoading}
        />
      </div>

      <button
        onClick={sendEther}
        disabled={isLoading}
        style={{
          padding: "10px 20px",
          backgroundColor: isLoading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "전송 중..." : "이더리움 전송"}
      </button>

      <button
        onClick={fetchPaymentHistory}
        disabled={isLoading}
        style={{
          padding: "10px 20px",
          backgroundColor: isLoading ? "#ccc" : "#28a745",
          color: "white",
          border: "none",
          cursor: isLoading ? "not-allowed" : "pointer",
          marginLeft: "10px",
        }}
      >
        결제 내역 조회
      </button>

      {transactionHash && (
        <p style={{ marginTop: "20px" }}>
          <strong>트랜잭션 해시:</strong> {transactionHash}
        </p>
      )}

      {errorMessage && (
        <p style={{ color: "red", marginTop: "10px" }}>
          <strong>오류:</strong> {errorMessage}
        </p>
      )}

      {paymentHistory.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>결제 내역</h2>
          <ul>
            {paymentHistory.map((payment, index) => (
              <li key={index}>
                <p>보낸 사람: {payment.payer}</p>
                <p>받는 사람: {payment.payee}</p>
                <p>금액: {payment.amount} ETH</p>
                <p>시간: {payment.timestamp}</p>
                <hr />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
