package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/sunls24/gox/notifier"
)

const heartbeatInterval = 25 * time.Second

func Stream(c *echo.Context) error {
	to := c.QueryParam("to")
	if to == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "missing to")
	}

	ctx := c.Request().Context()
	if to == Config(ctx).AdminAddress {
		to = subAll
	}

	w := c.Response()
	flusher, ok := w.(http.Flusher)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, "streaming not supported")
	}
	h := w.Header()
	h.Set(echo.HeaderContentType, "text/event-stream")
	h.Set(echo.HeaderCacheControl, "no-cache")
	h.Set(echo.HeaderConnection, "keep-alive")
	h.Set("X-Accel-Buffering", "no")
	w.WriteHeader(http.StatusOK)

	if _, err := fmt.Fprint(w, "retry: 3000\n\n"); err != nil {
		return nil
	}
	flusher.Flush()

	ticker := time.NewTicker(heartbeatInterval)
	defer ticker.Stop()

	for {
		ch, cancel := notifier.Wait(to)
		select {
		case v := <-ch:
			cancel()
			data, err := json.Marshal(v)
			if err != nil {
				return nil
			}
			if _, err := fmt.Fprintf(w, "event: mail\ndata: %s\n\n", data); err != nil {
				return nil
			}
			flusher.Flush()
		case <-ticker.C:
			cancel()
			if _, err := fmt.Fprint(w, ": ping\n\n"); err != nil {
				return nil
			}
			flusher.Flush()
		case <-ctx.Done():
			cancel()
			return nil
		}
	}
}
