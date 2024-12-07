// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentContract {
    event PaymentSent(address indexed payer, address indexed payee, uint256 amount, uint256 timestamp);

    struct Payment {
        address payer;
        address payee;
        uint256 amount;
        uint256 timestamp;
    }

    Payment[] public paymentHistory;

    function sendPayment(address payable _payee) public payable {
        require(msg.value > 0, "Payment amount must be greater than zero");
        require(_payee != address(0), "Payee address cannot be zero address");

        _payee.transfer(msg.value);

        paymentHistory.push(Payment({
            payer: msg.sender,
            payee: _payee,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        emit PaymentSent(msg.sender, _payee, msg.value, block.timestamp);
    }

    function getPaymentHistory() public view returns (Payment[] memory) {
        return paymentHistory;
    }
}
