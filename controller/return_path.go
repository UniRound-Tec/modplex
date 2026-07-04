package controller

import (
	"strings"

	"github.com/zofar/modplex/common"
	"github.com/zofar/modplex/setting/system_setting"
)

func paymentReturnPath(suffix string) string {
	base := strings.TrimRight(system_setting.ServerAddress, "/")
	return base + common.ThemeAwarePath(suffix)
}
