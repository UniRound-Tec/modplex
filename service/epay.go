package service

import (
	"github.com/zofar/modplex/setting/operation_setting"
	"github.com/zofar/modplex/setting/system_setting"
)

func GetCallbackAddress() string {
	if operation_setting.CustomCallbackAddress == "" {
		return system_setting.ServerAddress
	}
	return operation_setting.CustomCallbackAddress
}
