import "./App.css";
import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import Caver from "caver-js";
import { CONTRACTADDRESS, ABI } from "./config.js";

function App() {
  const caver = new Caver(window.klaytn);

  const [account, setAccount] = useState("not connect");
  const [balance1, setBalance] = useState(0);
  const [index, setIndex] = useState(0);
  const [limit, setLimit] = useState("");
  const [startBlock, setStartBlock] = useState(0);
  const [saleAmount, setsaleAmount] = useState(0);
  const [amount, setAmount] = useState(0);
  const [price, setPrice] = useState(0);
  const [nowBlock, setBlock] = useState(0);

  function onChange(e) {
    setAmount(e.target.value);
    console.log(e.target.value);
  }

  useEffect(() => {
    if (typeof klaytn !== "undefined") {
      try {
        check_status();
        componentMount();
        // setCaver(caver);
      } catch (err) {
        console.log(err);
      }
    }
  }, []);
  const getBlockNumber = async () => {
    const blockNumber = await caver.klay.getBlockNumber();
    setBlock(blockNumber);
  };

  //userEffect 안에 있으면 한번 렌더되고, 계속 불러온 값 그대로만 유지되어서
  //function 으로 빼서 관리.
  function componentMount() {
    setInterval(() => {
      getBlockNumber();
    }, 1000);
  }

  const connectKaikas = async () => {
    const accounts = await window.klaytn.enable();
    const account = window.klaytn.selectedAddress;
    const balance = await caver.klay.getBalance(account);
    setAccount(accounts[0]);
    setBalance(balance);
  };

  async function check_status() {
    const myContract = new caver.klay.Contract(ABI, CONTRACTADDRESS);
    await myContract.methods
      .mintingInformation()
      .call()
      .then((result) => {
        console.log(result);
        setIndex(result[1]);
        setLimit(parseInt(result[2]));
        setStartBlock(parseInt(result[4]));
        setsaleAmount(parseInt(result[5]));
        setPrice(parseInt(result[6]));
      });
  }

  async function publicMint() {
    if (window.klaytn.networkVersion === 8217) {
      console.log("메인넷");
    } else if (window.klaytn.networkVersion === 1001) {
      console.log("테스트넷");
    } else {
      alert("Error: 클레이튼 네트워크로 연결되지 않았습니다");
      return;
    }
    if (!account) {
      alert("Error: 지갑을 연결해주세요");
      return;
    }
    const myContract = new caver.klay.Contract(ABI, CONTRACTADDRESS);
    await check_status();
    if (saleAmount + 1 <= index) {
      alert("모든 물량이 소진되었습니다");
      return;
    } else if (nowBlock <= startBlock) {
      alert("아직 민팅이 시작되지 않았습니다.");
      return;
    }
    const total_value = Number(amount * price);
    try {
      const gasAmount = await myContract.methods
        .publicMint(amount)
        .estimateGas({
          from: account,
          gas: 6000000,
          value: total_value,
        });
      const result = await myContract.methods.publicMint(amount).send({
        from: account,
        gas: gasAmount,
        value: total_value,
      });
      if (result != null) {
        console.log(result);
        alert("민팅에 성공하였습니다.");
      }
    } catch (error) {
      console.log(error);
      alert("민팅에 실패하였습니다");
    }
  }

  return (
    <div className="App">
      <div className="container">
        <form
          className="gradient col-lg-5 mt-5"
          style={{ borderRadius: "25px", boxShadow: "1px 1px 10px #000000" }}
        >
          <h2 style={{ color: "#FFFFFF" }}>MINTING</h2>
          <p className="blockNumber" style={{ color: "#FFFFFF" }}>
            BLOCK NUMBER: {nowBlock}
          </p>
          <p className="mintStartBlockNumber" style={{ color: "#FFFFFF" }}>
            MIINT START BLOCKNUMBER: #{startBlock}
          </p>
          <p className="mintLimitPerBlock" style={{ color: "#FFFFFF" }}>
            MINT LIMIT PER BLOCK: {limit}
          </p>
          <div
            className="card"
            id="wallet-address"
            style={{ marginTop: "3px", boxShadow: "1px 1px 4px #000000" }}
          >
            <h2>MY WALLET</h2>
            <Button
              variant="secondary"
              size="lg"
              active
              onClick={connectKaikas}
            >
              Connect Kaikas
            </Button>
            <p>YOUR ADDRESS : {account} </p>
            <p>YOUR BALANCE : {balance1}</p>
          </div>
          <div>
            <h2 style={{ color: "#FFFFFF" }}>MINT</h2>
            <p style={{ color: "#FFFFFF" }}>
              {index - 1}/{saleAmount}
            </p>
            <label style={{ color: "#FFFFFF" }}>MINT AMOUNT : 3</label>
            <p>
              <input
                type="number"
                name="amount"
                min="1"
                max="3"
                onChange={onChange}
              />
            </p>
            <Button variant="primary" size="lg" active onClick={publicMint}>
              Mint/Buy
            </Button>{" "}
            <br />
            <br />
            <p className="mintPrice" style={{ color: "#FFFFFF" }}>
              MINT PRICE : {price / 1000000000000000000} KLAY PER MINT.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
