// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.6.0;

/**
 * @dev An interface to extend gTokens with liquidity mining capabilities.
 *      See GCTokenBase.sol and GATokenBase.sol for further documentation.
 */
interface GMining
{
	// view functions
	function miningToken() external view returns (address _miningToken);
	function mtcToken() external view returns (address _mtcToken);
	function exchange() external view returns (address _exchange);
	function miningGulpRange() external view returns (uint256 _miningMinGulpAmount, uint256 _miningMaxGulpAmount);
	function mtcGulpRange() external view returns (uint256 _mtcMinGulpAmount, uint256 _mtcMaxGulpAmount);

	// priviledged functions
	function setExchange(address _exchange) external;
	function setMiningGulpRange(uint256 _miningMinGulpAmount, uint256 _miningMaxGulpAmount) external;
	function setMtcGulpRange(uint256 _mtcMinGulpAmount, uint256 _mtcMaxGulpAmount) external;
}
