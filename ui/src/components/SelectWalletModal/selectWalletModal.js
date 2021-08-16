import React from "react";
import { Modal } from "react-bootstrap";
import Metamask from "../../assets/images/Metamask.svg";
import WalletConnect from "../../assets/images/WalletConnect.svg";

// import creditIcom from "../../assets/images/credit-card.svg"
function WalletSelectDialog(props) {

  return (
    <>
      <Modal
        className="connect-modal"
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        dialogClassName="modal-connect-ui whiteBg"
        backdropClassName="custom-backdrop"
        contentClassName="custom-content pb-0"
        centered
        show={true}
        onHide={() => props.hideShow()}
      >
        <Modal.Body>
          <div className="row">
            <div
              className="col-md-6"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
              onClick={() => props.connectWithWallet("metamask")}
            >
              <img src={Metamask} alt="" style={{ width: 100, height: 100 }} />
              <h5>Metamask</h5>
            </div>

            <div
              className="col-md-6"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
              onClick={() => props.connectWithWallet("walletConnect")}
            >
              <img
                src={WalletConnect}
                alt=""
                style={{ width: 100, height: 100 }}
              />
              <h5 style={{ cursor: "pointer" }}>Wallet Connect</h5>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default React.memo(WalletSelectDialog);
