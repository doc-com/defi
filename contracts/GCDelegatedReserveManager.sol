// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.6.0;

import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";

import { GToken } from "./GToken.sol";
import { G } from "./G.sol";
import { GC } from "./GC.sol";

/**
 * @dev This library implements data structure abstraction for the delegated
 *      reserve management code in order to circuvent the EVM contract size limit.
 *      It is therefore a public library shared by all gcToken Type 2 contracts and
 *      needs to be published alongside them. See GCTokenType2.sol for further
 *      documentation.
 */
library GCDelegatedReserveManager
{
	using SafeMath for uint256;
	using GCDelegatedReserveManager for GCDelegatedReserveManager.Self;

	uint256 constant MAXIMUM_COLLATERALIZATION_RATIO = 96e16; // 96% of 50% = 48%
	uint256 constant DEFAULT_COLLATERALIZATION_RATIO = 66e16; // 66% of 50% = 33%
	uint256 constant DEFAULT_COLLATERALIZATION_MARGIN = 15e16; // 15% of 50% = 7.5%

	struct Self {
		address reserveToken;
		address underlyingToken;

		address exchange;

		address miningToken;
		uint256 miningMinGulpAmount;
		uint256 miningMaxGulpAmount;

		address borrowToken;

		address mtcToken;
		address mtcReserveToken;
		uint256 mtcMinGulpAmount;
		uint256 mtcMaxGulpAmount;

		uint256 collateralizationRatio;
		uint256 collateralizationMargin;
	}

	/**
	 * @dev Initializes the data structure. This method is exposed publicly.
	 *      Note that the underlying borrowing token must match the mtc
	 *      reserve token given that funds borrowed will be reinvested in
	 *      the provided mtc token (gToken).
	 * @param _reserveToken The ERC-20 token address of the reserve token (cToken).
	 * @param _miningToken The ERC-20 token address to be collected from
	 *                     liquidity mining (COMP).
	 * @param _borrowToken The ERC-20 token address of the borrow token (cToken).
	 * @param _mtcToken The ERC-20 token address of the mtc token (gToken).
	 */
	function init(Self storage _self, address _reserveToken, address _miningToken, address _borrowToken, address _mtcToken) public
	{
		address _underlyingToken = GC.getUnderlyingToken(_reserveToken);
		address _borrowUnderlyingToken = GC.getUnderlyingToken(_borrowToken);
		address _mtcReserveToken = GToken(_mtcToken).reserveToken();
		assert(_borrowUnderlyingToken == _mtcReserveToken);

		_self.reserveToken = _reserveToken;
		_self.underlyingToken = _underlyingToken;

		_self.exchange = address(0);

		_self.miningToken = _miningToken;
		_self.miningMinGulpAmount = 0;
		_self.miningMaxGulpAmount = 0;

		_self.borrowToken = _borrowToken;

		_self.mtcToken = _mtcToken;
		_self.mtcReserveToken = _mtcReserveToken;
		_self.mtcMinGulpAmount = 0;
		_self.mtcMaxGulpAmount = 0;

		_self.collateralizationRatio = DEFAULT_COLLATERALIZATION_RATIO;
		_self.collateralizationMargin = DEFAULT_COLLATERALIZATION_MARGIN;

		GC.safeEnter(_reserveToken);
	}

	/**
	 * @dev Sets the contract address for asset conversion delegation.
	 *      This library converts the miningToken into the underlyingToken
	 *      and use the assets to back the reserveToken. See GExchange.sol
	 *      for further documentation. This method is exposed publicly.
	 * @param _exchange The address of the contract that implements the
	 *                  GExchange interface.
	 */
	function setExchange(Self storage _self, address _exchange) public
	{
		_self.exchange = _exchange;
	}

	/**
	 * @dev Sets the range for converting liquidity mining assets. This
	 *      method is exposed publicly.
	 * @param _miningMinGulpAmount The minimum amount, funds will only be
	 *                             converted once the minimum is accumulated.
	 * @param _miningMaxGulpAmount The maximum amount, funds beyond this
	 *                             limit will not be converted and are left
	 *                             for future rounds of conversion.
	 */
	function setMiningGulpRange(Self storage _self, uint256 _miningMinGulpAmount, uint256 _miningMaxGulpAmount) public
	{
		require(_miningMinGulpAmount <= _miningMaxGulpAmount, "invalid range");
		_self.miningMinGulpAmount = _miningMinGulpAmount;
		_self.miningMaxGulpAmount = _miningMaxGulpAmount;
	}

	/**
	 * @dev Sets the range for converting mtc profits. This
	 *      method is exposed publicly.
	 * @param _mtcMinGulpAmount The minimum amount, funds will only be
	 *                             converted once the minimum is accumulated.
	 * @param _mtcMaxGulpAmount The maximum amount, funds beyond this
	 *                             limit will not be converted and are left
	 *                             for future rounds of conversion.
	 */
	function setMtcGulpRange(Self storage _self, uint256 _mtcMinGulpAmount, uint256 _mtcMaxGulpAmount) public
	{
		require(_mtcMinGulpAmount <= _mtcMaxGulpAmount, "invalid range");
		_self.mtcMinGulpAmount = _mtcMinGulpAmount;
		_self.mtcMaxGulpAmount = _mtcMaxGulpAmount;
	}

	/**
	 * @dev Sets the collateralization ratio and margin. These values are
	 *      percentual and relative to the maximum collateralization ratio
	 *      provided by the underlying asset. This method is exposed publicly.
	 * @param _collateralizationRatio The target collateralization ratio,
	 *                                between lend and borrow, that the
	 *                                reserve will try to maintain.
	 * @param _collateralizationMargin The deviation from the target ratio
	 *                                 that should be accepted.
	 */
	function setCollateralizationRatio(Self storage _self, uint256 _collateralizationRatio, uint256 _collateralizationMargin) public
	{
		require(_collateralizationMargin <= _collateralizationRatio && _collateralizationRatio.add(_collateralizationMargin) <= MAXIMUM_COLLATERALIZATION_RATIO, "invalid ratio");
		_self.collateralizationRatio = _collateralizationRatio;
		_self.collateralizationMargin = _collateralizationMargin;
	}

	/**
	 * @dev Performs the reserve adjustment actions leaving a liquidity room,
	 *      if necessary. It will attempt to incorporate the liquidity mining
	 *      assets into the reserve, the profits from the underlying mtc
	 *      investment and adjust the collateralization targeting the
	 *      configured ratio. This method is exposed publicly.
	 * @param _roomAmount The underlying token amount to be available after the
	 *                    operation. This is revelant for withdrawals, once the
	 *                    room amount is withdrawn the reserve should reflect
	 *                    the configured collateralization ratio.
	 * @return _success A boolean indicating whether or not both actions suceeded.
	 */
	function adjustReserve(Self storage _self, uint256 _roomAmount) public returns (bool _success)
	{
		bool _success1 = _self._gulpMiningAssets();
		bool _success2 = _self._gulpMtcAssets();
		bool _success3 = _self._adjustReserve(_roomAmount);
		return _success1 && _success2 && _success3;
	}

	/**
	 * @dev Calculates the collateralization ratio relative to the maximum
	 *      collateralization ratio provided by the underlying asset.
	 * @return _collateralizationRatio The target absolute collateralization ratio.
	 */
	function _calcCollateralizationRatio(Self storage _self) internal view returns (uint256 _collateralizationRatio)
	{
		return GC.getCollateralRatio(_self.reserveToken).mul(_self.collateralizationRatio).div(1e18);
	}

	/**
	 * @dev Incorporates the liquidity mining assets into the reserve. Assets
	 *      are converted to the underlying asset and then added to the reserve.
	 *      If the amount available is below the minimum, or if the exchange
	 *      contract is not set, nothing is done. Otherwise the operation is
	 *      performed, limited to the maximum amount. Note that this operation
	 *      will incorporate to the reserve all the underlying token balance
	 *      including funds sent to it or left over somehow.
	 * @return _success A boolean indicating whether or not the action succeeded.
	 */
	function _gulpMiningAssets(Self storage _self) internal returns (bool _success)
	{
		if (_self.exchange == address(0)) return true;
		if (_self.miningMaxGulpAmount == 0) return true;
		uint256 _miningAmount = G.getBalance(_self.miningToken);
		if (_miningAmount == 0) return true;
		if (_miningAmount < _self.miningMinGulpAmount) return true;
		_self._convertMiningToUnderlying(G.min(_miningAmount, _self.miningMaxGulpAmount));
		return GC.lend(_self.reserveToken, G.getBalance(_self.underlyingToken));
	}

	/**
	 * @dev Incorporates the profits from mtc into the reserve. Assets
	 *      are converted to the underlying asset and then added to the reserve.
	 *      If the amount available is below the minimum, or if the exchange
	 *      contract is not set, nothing is done. Otherwise the operation is
	 *      performed, limited to the maximum amount. Note that this operation
	 *      will incorporate to the reserve all the mtc reserve token balance
	 *      including funds sent to it or left over somehow.
	 * @return _success A boolean indicating whether or not the action succeeded.
	 */
	function _gulpMtcAssets(Self storage _self) internal returns (bool _success)
	{
		if (_self.exchange == address(0)) return true;
		if (_self.mtcMaxGulpAmount == 0) return true;
		// calculates how much was borrowed
		uint256 _borrowAmount = GC.fetchBorrowAmount(_self.borrowToken);
		// calculates how much can be redeemed from the mtc token
		uint256 _totalShares = G.getBalance(_self.mtcToken);
		uint256 _redeemableAmount = _self._calcWithdrawalCostFromShares(_totalShares);
		// if there is a profit and that amount is within range
		// it gets converted to the underlying reserve token and
		// incorporated to the reserve
		if (_redeemableAmount <= _borrowAmount) return true;
		uint256 _mtcAmount = _redeemableAmount.sub(_borrowAmount);
		if (_mtcAmount < _self.mtcMinGulpAmount) return true;
		uint256 _grossShares = _self._calcWithdrawalSharesFromCost(G.min(_mtcAmount, _self.mtcMaxGulpAmount));
		_grossShares = G.min(_grossShares, _totalShares);
		if (_grossShares == 0) return true;
		_success = _self._withdraw(_grossShares);
		if (!_success) return false;
		_self._convertMtcReserveToUnderlying(G.getBalance(_self.mtcReserveToken));
		return GC.lend(_self.reserveToken, G.getBalance(_self.underlyingToken));
	}

	/**
	 * @dev Adjusts the reserve to match the configured collateralization
	 *      ratio. It uses the reserve collateral to borrow a proper amount
	 *      of the mtc token reserve asset and deposit it. Or it
	 *      redeems from the mtc token and repays the loan.
	 * @param _roomAmount The amount of underlying token to be liquid after
	 *                    the operation.
	 * @return _success A boolean indicating whether or not the action succeeded.
	 */
	function _adjustReserve(Self storage _self, uint256 _roomAmount) internal returns (bool _success)
	{
		// calculates the percental change from the current reserve
		// and the reserve deducting the room amount
		uint256 _scalingRatio;
		{
			uint256 _reserveAmount = GC.fetchLendAmount(_self.reserveToken);
			_roomAmount = G.min(_roomAmount, _reserveAmount);
			uint256 _newReserveAmount = _reserveAmount.sub(_roomAmount);
			_scalingRatio = _reserveAmount > 0 ? uint256(1e18).mul(_newReserveAmount).div(_reserveAmount) : 0;
		}
		// calculates the borrowed amount and range in terms of the reserve token
		uint256 _borrowAmount = GC.fetchBorrowAmount(_self.borrowToken);
		uint256 _newBorrowAmount;
		uint256 _minBorrowAmount;
		uint256 _maxBorrowAmount;
		{
			uint256 _freeAmount = GC.getLiquidityAmount(_self.borrowToken);
			uint256 _totalAmount = _borrowAmount.add(_freeAmount);
			// applies the scaling ratio to account for the required room
			uint256 _newTotalAmount = _totalAmount.mul(_scalingRatio).div(1e18);
			_newBorrowAmount = _newTotalAmount.mul(_self.collateralizationRatio).div(1e18);
			uint256 _newMarginAmount = _newTotalAmount.mul(_self.collateralizationMargin).div(1e18);
			_minBorrowAmount = _newBorrowAmount.sub(G.min(_newMarginAmount, _newBorrowAmount));
			_maxBorrowAmount = G.min(_newBorrowAmount.add(_newMarginAmount), _newTotalAmount);
		}
		// if the borrow amount is below the lower bound,
		// borrows the diference and deposits in the mtc token contract
		if (_borrowAmount < _minBorrowAmount) {
			uint256 _amount = _newBorrowAmount.sub(_borrowAmount);
			_amount = G.min(_amount, GC.getMarketAmount(_self.borrowToken));
			_success = GC.borrow(_self.borrowToken, _amount);
			if (!_success) return false;
			_success = _self._deposit(_amount);
			if (_success) return true;
			GC.repay(_self.borrowToken, _amount);
			return false;
		}
		// if the borrow amount is above the upper bound,
		// redeems the diference from the mtc token contract and
		// repays the loan
		if (_borrowAmount > _maxBorrowAmount) {
			uint256 _amount = _borrowAmount.sub(_newBorrowAmount);
			uint256 _grossShares = _self._calcWithdrawalSharesFromCost(_amount);
			_grossShares = G.min(_grossShares, G.getBalance(_self.mtcToken));
			if (_grossShares == 0) return true;
			_success = _self._withdraw(_grossShares);
			if (!_success) return false;
			uint256 _repayAmount = G.min(_borrowAmount, G.getBalance(_self.mtcReserveToken));
			return GC.repay(_self.borrowToken, _repayAmount);
		}
		return true;
	}

	/**
	 * @dev Calculates how much of the mtc reserve token can be redeemed
	 *      from a given amount of shares.
	 * @param _grossShares The number of shares to redeem.
	 * @return _cost The reserve token amount to be withdraw.
	 */
	function _calcWithdrawalCostFromShares(Self storage _self, uint256 _grossShares) internal view returns (uint256 _cost) {
		uint256 _totalReserve = GToken(_self.mtcToken).totalReserve();
		uint256 _totalSupply = GToken(_self.mtcToken).totalSupply();
		uint256 _withdrawalFee = GToken(_self.mtcToken).withdrawalFee();
		(_cost,) = GToken(_self.mtcToken).calcWithdrawalCostFromShares(_grossShares, _totalReserve, _totalSupply, _withdrawalFee);
		return _cost;
	}

	/**
	 * @dev Calculates how many shares must be redeemed in order to withdraw
	 *      so much of the mtc reserve token.
	 * @param _cost The amount of the reserve token to be received on
	 *               withdrawal.
	 * @return _grossShares The number of shares one must redeem.
	 */
	function _calcWithdrawalSharesFromCost(Self storage _self, uint256 _cost) internal view returns (uint256 _grossShares) {
		uint256 _totalReserve = GToken(_self.mtcToken).totalReserve();
		uint256 _totalSupply = GToken(_self.mtcToken).totalSupply();
		uint256 _withdrawalFee = GToken(_self.mtcToken).withdrawalFee();
		(_grossShares,) = GToken(_self.mtcToken).calcWithdrawalSharesFromCost(_cost, _totalReserve, _totalSupply, _withdrawalFee);
		return _grossShares;
	}

	/**
	 * @dev Deposits into the mtc token contract.
	 * @param _cost The amount of thr mtc reserve token to be deposited.
	 * @return _success A boolean indicating whether or not the action succeeded.
	 */
	function _deposit(Self storage _self, uint256 _cost) internal returns (bool _success)
	{
		G.approveFunds(_self.mtcReserveToken, _self.mtcToken, _cost);
		try GToken(_self.mtcToken).deposit(_cost) {
			return true;
		} catch (bytes memory /* _data */) {
			G.approveFunds(_self.mtcReserveToken, _self.mtcToken, 0);
			return false;
		}
	}

	/**
	 * @dev Withdraws from the mtc token contract.
	 * @param _grossShares The number of shares to be redeemed.
	 * @return _success A boolean indicating whether or not the action succeeded.
	 */
	function _withdraw(Self storage _self, uint256 _grossShares) internal returns (bool _success)
	{
		try GToken(_self.mtcToken).withdraw(_grossShares) {
			return true;
		} catch (bytes memory /* _data */) {
			return false;
		}
	}

	/**
	 * @dev Converts a given amount of the mining token to the underlying
	 *      token using the external exchange contract. Both amounts are
	 *      deducted and credited, respectively, from the current contract.
	 * @param _inputAmount The amount to be converted.
	 */
	function _convertMiningToUnderlying(Self storage _self, uint256 _inputAmount) internal
	{
		G.dynamicConvertFunds(_self.exchange, _self.miningToken, _self.underlyingToken, _inputAmount, 0);
	}

	/**
	 * @dev Converts a given amount of the mtc reserve token to the
	 *      underlying token using the external exchange contract. Both
	 *      amounts are deducted and credited, respectively, from the
	 *      current contract.
	 * @param _inputAmount The amount to be converted.
	 */
	function _convertMtcReserveToUnderlying(Self storage _self, uint256 _inputAmount) internal
	{
		G.dynamicConvertFunds(_self.exchange, _self.mtcReserveToken, _self.underlyingToken, _inputAmount, 0);
	}
}
