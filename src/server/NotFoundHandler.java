package server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;

/**
 * GET 요청 처리
 * -- 만드는 규칙 --
 * 1. HttpHandler 인터페이스를 구현한다.
 * 2. handler(HttpExchange) 메서드 하나를 재정의한다.
 * 3. main 에서 createContext 로 경로를 짝지어 등록한다.
 */
public class NotFoundHandler implements HttpHandler {

    private static final String NotFoundHOME_PAGE = """
            <!doctype html>
            <html lang="ko">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>NotFoundHTTP서버</title>
              </head>
              <body>
                <h1 style='color:blue'>내가 자바로 만든 순수 HTTP 서버</h1>
                <ul>
                  <li><a href="/health">서버 상태 확인</a></li>
                  <li><a href="/api/users">사용자 목록(JSON)</a></li>
                </ul>
              </body>
            </html>
            
            """;

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            // / <-- 이 경로를 처리하는 핸들러
            // 주의할 점
            // "/" 로 등록한 핸들러는 다른 핸들러가 맡지 않은 "모든" 경로를 받아요
            // 그래서 정확히 "/" 인지 직접 확인하고, 아니면 404를 돌려 줘야 한다.
            String path = exchange.getRequestURI().getPath();
            if (!path.equals("/")) {
                SimpleHttpServer.sendResponse(exchange, 404,
                        SimpleHttpServer.TYPE_TEXT, "404 Not Found : " + NotFoundHOME_PAGE);
                return;
            }

        } finally {
            exchange.close();
        }

    }
}



