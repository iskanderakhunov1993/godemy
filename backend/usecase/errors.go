package usecase

import "errors"

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrConflict           = errors.New("conflict")
	ErrUnauthorized       = errors.New("unauthorized")
	ErrForbidden          = errors.New("forbidden")
	ErrNotFound           = errors.New("not found")
	ErrInvalidInput       = errors.New("invalid input")
)
