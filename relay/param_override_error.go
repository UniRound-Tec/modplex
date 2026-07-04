package relay

import (
	relaycommon "github.com/zofar/modplex/relay/common"
	"github.com/zofar/modplex/types"
)

func newAPIErrorFromParamOverride(err error) *types.ModplexError {
	if fixedErr, ok := relaycommon.AsParamOverrideReturnError(err); ok {
		return relaycommon.ModplexErrorFromParamOverride(fixedErr)
	}
	return types.NewError(err, types.ErrorCodeChannelParamOverrideInvalid, types.ErrOptionWithSkipRetry())
}
