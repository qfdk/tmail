package ent

import (
	"context"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	cfg "tmail/config"
)

//go:generate go run -mod=mod entgo.io/ent/cmd/ent generate ./schema

func New(db cfg.Database) (*Client, error) {
	client, err := Open(db.Driver, dsn(db))
	if err != nil {
		return nil, err
	}
	return client, client.Schema.Create(context.TODO())
}

func dsn(db cfg.Database) string {
	switch db.Driver {
	case "mysql":
		return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&loc=Asia%%2FShanghai&charset=utf8mb4",
			db.User, db.Pass, db.Host, db.Port, db.Name)
	default:
		return fmt.Sprintf("host=%s port=%s dbname=%s user=%s password=%s sslmode=disable timezone=Asia/Shanghai",
			db.Host, db.Port, db.Name, db.User, db.Pass)
	}
}
