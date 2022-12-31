import React, {useEffect, useRef, useState} from "react";
import style from "./index.module.scss";
import {ReactComponent as TelegramIcon} from "@/Assets/Images/Social/Telegram.svg";
import {ReactComponent as TwitterIcon} from "@/Assets/Images/Social/Twitter.svg";
import {ReactComponent as DiscordIcon} from "@/Assets/Images/Social/Discord.svg";
import {ReactComponent as GlobalIcon} from "@/Assets/Images/Social/Global.svg";
import {ReactComponent as PaperIcon} from "@/Assets/Images/Social/Paper.svg";
import {useWallet} from "@manahippo/aptos-wallet-adapter";
import {PopupsActions, useAppDispatch, useAppSelector} from "@/MyRedux";
import {HippoSwapService} from "@/Services";
import {RawCoinInfo} from "@manahippo/coin-list";
import _ from "lodash";
import {CommonUtility, CustomHookUtility} from "@/Utilities";
import {toast} from "react-toastify";
import {AptospadBusinessService} from "@/Services/AptospadBusiness.service";

interface ITF_DefaultForm {
  pay: RawCoinInfo;
  payAmount: string;
  receive: RawCoinInfo;
  receiveAmount: string;
  maxGas: string;
  slip: string;
}

export default function Swap() {
  const dispatch = useAppDispatch();
  const walletAdapter = useWallet();
  const popups = useAppSelector((state) => state.popups);
  const transactionSettings = useAppSelector((state) => state.transactionSettings);
  const refPay = useRef(null);
  CustomHookUtility.useOnClickOutside(refPay, () => (refPay.current as any)?.classList.remove(style["expand"]));
  const refReceive = useRef(null);
  CustomHookUtility.useOnClickOutside(refReceive, () => (refReceive.current as any)?.classList.remove(style["expand"]));
  const coinList = useRef<RawCoinInfo[]>(HippoSwapService.coinList.getCoinInfoList()).current;
  const defaultForm: ITF_DefaultForm = {
    "pay": _.find(coinList, (o) => o.symbol.toUpperCase() === "DEVUSDT")!,
    "payAmount": "0",
    "receive": _.find(coinList, (o) => o.symbol.toUpperCase() === "APT")!,
    "receiveAmount": "0",
    "maxGas": "10000000",
    "slip": "0"
  };
  const [form, setForm] = useState<ITF_DefaultForm>(defaultForm);
  const [balancePaySwap, setBalancePaySwap] = useState<number>(0);
  const [balanceReceiveSwap, setBalanceReceiveSwap] = useState<number>(0);
  const [rateSwap, setRateSwap] = useState<number>(1);

  const toggleCoinList = (which: "pay" | "receive") => {
    if (which === "pay") {
      (refReceive.current as any).classList.remove(style["expand"]);
      (refPay.current as any).classList.toggle(style["expand"]);
    } else {
      (refPay.current as any).classList.remove(style["expand"]);
      (refReceive.current as any).classList.toggle(style["expand"]);
    }
  };

  const openChooseWalletPopup = () => {
    walletAdapter.disconnect();
    dispatch(PopupsActions.togglePopup({
      "popupName": "chooseWallet",
      "display": true
    }));
  };

  const onSwapIconClicked = () => {
    const pay = form.receive;
    const receive = form.pay;

    console.log(pay);

    setForm({
      ...form, ...{
        pay,
        receive
      }
    });
  };

  const onSwapButtonClicked = () => {
    console.log(form, transactionSettings);
  };

  const onSelectCoin = (type: "pay" | "receive", item: RawCoinInfo) => {
    if (type === "pay") {
      if (item.symbol === form.receive.symbol) {
        const pay = item;
        const receive = form.pay;
        setForm({
          ...form, ...{
            pay,
            receive
          }
        });
      } else {
        setForm({
          ...form,
          [type]: item
        });
      }
    } else {
      if (item.symbol === form.pay.symbol) {
        const pay = form.receive;
        const receive = item;
        setForm({
          ...form, ...{
            pay,
            receive
          }
        });
      } else {
        setForm({
          ...form,
          [type]: item
        });
      }
    }

    (refReceive.current as any).classList.remove(style["expand"]);
    (refPay.current as any).classList.remove(style["expand"]);
  };

  const onInputChange = (type: "pay" | "receive", value: string) => {
    if (CommonUtility.allowSixDigitsAfterDecimalPoint(value)) {
      if (type === "pay") {
        const payAmount = value;
        const receiveAmount = (parseFloat(value) * rateSwap).toFixed(6).toString();
        setForm({
          ...form, ...{
            payAmount,
            receiveAmount
          }
        });
      } else {
        const receiveAmount = value;
        const payAmount = (parseFloat(value) / rateSwap).toFixed(6).toString();
        setForm({
          ...form, ...{
            payAmount,
            receiveAmount
          }
        });
      }
    }
  };

  useEffect(() => {
    (async () => {
      if (walletAdapter.connected) {
        const businessService = new AptospadBusinessService(walletAdapter);
        try {
          const payBalance = await businessService.getBalanceOf(walletAdapter.account?.address!, form.pay.token_type.type);
          const receiveBalance = await businessService.getBalanceOf(walletAdapter.account?.address!, form.receive.token_type.type);
          setBalancePaySwap(Number(payBalance) / Math.pow(10, form.pay.decimals));
          setBalanceReceiveSwap(Number(receiveBalance) / Math.pow(10, form.receive.decimals));

          const coinPayId = form.pay.coingecko_id;
          const coinReceiveId = form.receive.coingecko_id;
          const prices = await businessService.getPriceFromCoinGecko([coinPayId, coinReceiveId], ["usd"]);
          console.log(prices);

          const priceOfCoinPay = prices[coinPayId]["usd"];
          const priceOfCoinReceive = prices[coinReceiveId]["usd"];
          setRateSwap(Number(priceOfCoinPay) / Number(priceOfCoinReceive));
        } catch (error) {
          setBalancePaySwap(0);
          setBalanceReceiveSwap(0);
        }
      }
    })();
  }, [walletAdapter.connected, form]);

  return (
    <div id={style["swap"]} className="container">
      <div className="d-flex gap-5 mb-5">
        <h2 className="h4 text-green-1" role="button">SWAP</h2>
        <a className="h4 text-green-2" href="https://app.kanalabs.io" target="_blank" rel="noreferrer">CROSS-CHAIN</a>
      </div>

      <form className={style["form"]}>
        <div className={`${style["input-has-select"]}`} ref={refPay}>
          <label htmlFor="payAmount" className="text-green-1 text-uppercase mb-2 ms-2" role="button">Pay</label>
          <div className={style["wrap"]}>
            <div className={style["select"]} onClick={() => toggleCoinList("pay")}>
              <div className={style["line-1"]}>
                <img src={form.pay.logo_url} alt=""/>
                <span>{form.pay.symbol}</span>
              </div>

              {
                walletAdapter.connected && <div className={style["line-2"]}>Balance</div>
              }
            </div>
            <div className={style["input"]}>
              <div className={style["line-1"]}>
                <input
                  type="number"
                  placeholder="0.00"
                  id="payAmount"
                  name="payAmount"
                  value={form.payAmount}
                  onInput={(e) => onInputChange("pay", e.currentTarget.value)}
                />
              </div>

              {
                walletAdapter.connected &&
                <div className={style["line-2"]}>{CommonUtility.commaFormatter(balancePaySwap)}</div>
              }
            </div>
          </div>
          <div className={style["wrap-options"]}>
            <ul className={style["options"]}>
              {
                coinList.map((item, key) => {
                  return (
                    <li className={`${style["option"]}`} key={key} onClick={() => onSelectCoin("pay", item)}>
                      <img src={item.logo_url} alt=""/>
                      <div className={style["token"]}>
                        <p className={style["symbol"]}>{item.symbol}</p>
                        <p className={style["name"]}>{item.name}</p>
                      </div>
                    </li>
                  );
                })
              }
            </ul>
          </div>
        </div>

        <img className={style["swap-icon"]} src="/images/swap.svg" alt="" role="button" onClick={() => onSwapIconClicked()}/>

        <div className={`${style["input-has-select"]}`} ref={refReceive}>
          <label htmlFor="receiveAmount" className="text-green-1 text-uppercase mb-2 ms-2" role="button">Receive</label>
          <div className={style["wrap"]}>
            <div className={style["select"]} onClick={() => toggleCoinList("receive")}>
              <div className={style["line-1"]}>
                <img src={form.receive.logo_url} alt=""/>
                <span>{form.receive.symbol}</span>
              </div>
              {
                walletAdapter.connected && <div className={style["line-2"]}>Balance</div>
              }

            </div>
            <div className={style["input"]}>
              <div className={style["line-1"]}>
                <input
                  type="number"
                  placeholder="0.00"
                  id="receiveAmount"
                  name="receiveAmount"
                  value={form.receiveAmount}
                  onInput={(e) => onInputChange("receive", e.currentTarget.value)}
                />
              </div>

              {
                walletAdapter.connected &&
                <div className={style["line-2"]}>{CommonUtility.commaFormatter(balanceReceiveSwap)}</div>
              }
            </div>
          </div>
          <div className={style["wrap-options"]}>
            <ul className={style["options"]}>
              {
                coinList.map((item, key) => {
                  return (
                    <li className={`${style["option"]}`} key={key} onClick={() => onSelectCoin("receive", item)}>
                      <img src={item.logo_url} alt=""/>
                      <div className={style["token"]}>
                        <p className={style["symbol"]}>{item.symbol}</p>
                        <p className={style["name"]}>{item.name}</p>
                      </div>
                    </li>
                  );
                })
              }
            </ul>
          </div>
        </div>

        <div
          className={`${style["slip"]} ms-2 mt-1 mb-5 text-green-1 fw-bold`}
          role="button"
          onClick={() => dispatch(PopupsActions.togglePopup({
            "popupName": "transactionSettings",
            "display": true
          }))}
        >
          Slip {transactionSettings.slippage}%
          <i className="fa fa-sliders ms-2" aria-hidden="true"></i>
        </div>

        <div className="d-flex justify-content-center">
          {
            !walletAdapter.connected && (
              <button
                className={`${style["butons"]} cbtn cbtn-lg cbtn-outline-gradient-blue`}
                type="button"
                onClick={() => openChooseWalletPopup()}
              >
                Connect to Wallet
              </button>
            )
          }

          {
            (walletAdapter.connected && !form.payAmount) && (
              <button
                className={`${style["butons"]} cbtn cbtn-lg cbtn-outline-gradient-blue`}
                type="button"
                onClick={() => toast.warn("Enter an Amount")}
              >
                Enter an Amount
              </button>
            )
          }

          {
            (walletAdapter.connected && form.payAmount && form.receiveAmount) && (
              <button
                disabled={Number(form.payAmount) > balancePaySwap}
                className={`${style["butons"]} cbtn cbtn-lg cbtn-outline-gradient-blue btn btn-gradient-blue w-50 fw-bold`}
                type="button"
                onClick={() => onSwapButtonClicked()}
              >
                Swap
              </button>
            )
          }
        </div>
      </form>

      <div className={style["icons"]}>
        <a href={process.env.TELEGRAM} target="_blank" rel="noreferrer">
          <TelegramIcon className={style["icon"]}/>
        </a>
        <a href={process.env.TWITTER} target="_blank" rel="noreferrer">
          <TwitterIcon className={style["icon"]}/>
        </a>
        <a href={process.env.DISCORD} target="_blank" rel="noreferrer">
          <DiscordIcon className={style["icon"]}/>
        </a>
        <a href={"/"} target="_blank" rel="noreferrer">
          <GlobalIcon className={style["icon"]}/>
        </a>
        <a href={"/"} target="_blank" rel="noreferrer">
          <PaperIcon className={style["icon"]}/>
        </a>
      </div>
    </div>
  );
}
