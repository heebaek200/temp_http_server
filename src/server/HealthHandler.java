package server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;

/**
 *  핸들러(handler) 란
 *  다루다, 처리하다 라는 뜻이며 핸들러는 처리하는 쪽 이라는 뜻이다.
 *  프로그래밍에서 어떤 일이 일어났을 때 실행될 코드를 가리킬 때 쓴다
 */
public class HealthHandler implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
             SimpleHttpServer.sendResponse(exchange, 200, SimpleHttpServer.TYPE_HTML, "OK");
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        } finally {
            exchange.close();
        }
    }
}
