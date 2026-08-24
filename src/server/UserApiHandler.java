package server;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

// /api/users -
// GET : 목록을 조회 한다.
// POST : 새 사용자를 등록한다.
public class UserApiHandler implements HttpHandler {

    // 실제로는 DB에 저장한다. 지금은 메모리 리스트로 대신 한다. 즉, 서버를 껐다 켜면 내용이 다 사라진다.
    private static final List<User> userList = new ArrayList();
    // 다음에 부여할 id
    private static int nextId = 1;

    // static 초기화 블록
    // 클래스가 메모리에 처음 올라갈 때 딱 한 번만 실행되는 코드 묶음
    // 이름도 없고, 우리가 직접 호출하지도 않는다. JVM 알아서 실행한다.
    static {
        addUser(new User("홍길동", "hong@naver.com"));
        addUser(new User("김철수", "cheolsu@gmail.com"));
        addUser(new User("이영희", "younghee@daum.net"));
        addUser(new User("박민수", "minsu@naver.com"));
        addUser(new User("최지은", "jieun@gmail.com"));
        addUser(new User("정현우", "hyunwoo@kakao.com"));
        addUser(new User("강수진", "sujin@naver.com"));
        addUser(new User("조성민", "seongmin@gmail.com"));
        addUser(new User("윤하늘", "haneul@daum.net"));

        // HTML 이스케이프 확인용 XSS 테스트 데이터
        addUser(new User(
                "김민준</pre><script>alert('XSS 테스트')</script><pre>",
                "minjun@gmail.com"
        ));

        addUser(new User("장유진", "yujin@kakao.com"));
        addUser(new User("임도윤", "doyoon@naver.com"));
        addUser(new User("한서연", "seoyeon@gmail.com"));
        addUser(new User("오준호", "junho@daum.net"));

        // 이벤트 속성을 이용한 XSS 테스트 데이터
        addUser(new User(
                "서예린<img src=x onerror=alert('이미지 XSS')>",
                "yerin@naver.com"
        ));

        addUser(new User("신태양", "taeyang@gmail.com"));
        addUser(new User("권나연", "nayeon@kakao.com"));
        addUser(new User("황재현", "jaehyun@naver.com"));
        addUser(new User("안소희", "sohee@daum.net"));
        addUser(new User("송우진", "woojin@gmail.com"));
    }

    private static synchronized int addUser(User user) {
        user.setId(nextId); // 최소 1 <- 쏙 들어감
        nextId++;
        userList.add(user);
        return user.getId();
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            // /api/users 경로 + Method (동작 정의) - GET, POST
            // 즉, 경로가 같아도 Method 가 다르면 하는 일이 다르다.
            // 그래서 이 핸들러 안에서 메서드로 한 번 더 갈라 준다.
            String method = exchange.getRequestMethod();

            if (method.equals("GET")) {

                Thread.sleep(2000);

                handleGet(exchange);
            } else if (method.equals("POST")) {
                handlePost(exchange);
            } else {
                // 405 를 보낼 때는 어떤 메서드가 되는지 Allow 헤더로 알려주는 것이 규칙이다.
                exchange.getResponseHeaders().set("Allow", "GET, POST");
                SimpleHttpServer.sendResponse(exchange, 405,
                        SimpleHttpServer.TYPE_TEXT, "지원하지 않는 메서드 입니다");
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            exchange.close();
        }
    }

    /**
     * 목록을 복사해서 다시 둘려 준다.
     * 왜 복사하는가?
     * 원본을 그대로 넘기면, Gson이 JSON 으로 바꾸면서 순회 도중에
     * 다른 스레드가 POST 로 add 요청을 만약 한다면 중간에 예외가 발생한다.
     * 즉, 순회 도중에 ArrayList 크기가 바뀌면 예외를 던지는 증상이 있다.
     *
     */
    private ArrayList<User> copyUserList() {
        return new ArrayList<>(userList);
    }

    /**
     * GET : 사용자 목록을 조회, (요청 HTTP 메세지 body 없음)
     * List<User>를 그대로 넘기면 Gson 이 JSON 배열로 바꿔 준다.
     */
    private void handleGet(HttpExchange exchange) throws IOException {
        // simple text에서 html로 수정
        String html = """
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>사용자 목록</title>
    
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
    
                    body {
                         margin: 0;
                         padding: 40px;
                         background-color: #f5f5f5;
                         color: #333;
                     }
            
                     .json-section {
                         background-color: #222;
                         color: white;
                         border-radius: 8px;
                     }
            
                     .json-header {
                         display: flex;
                         justify-content: space-between;
                         align-items: center;
                         padding: 15px;
                         border-bottom: 1px solid #555;
                     }
            
                     .json-header h2 {
                         margin: 0;
                         font-size: 18px;
                     }
            
                     .copy-button {
                         padding: 7px 14px;
                         border: none;
                         border-radius: 5px;
                         background-color: #2563eb;
                         color: white;
                         cursor: pointer;
                     }
            
                     pre {
                         margin: 0;
                         padding: 20px;
                         overflow-x: auto;
                         color: #b5f5c6;
                     }
                </style>
            </head>
    
            <body>
                <main>
                    <h1>사용자 목록</h1>
                    <p class="description">
                        현재 서버에 등록된 사용자입니다.
                    </p>
                    <br>
    
                    <section class="json-section">
                        <div class="json-header">
                            <h2>JSON 데이터</h2>
                            <button
                                type="button"
                                class="copy-button"
                                id="copyButton"
                            >
                                Copy
                            </button>
                        </div>
    
                        <pre id="jsonData">{{{ json_field }}}</pre>
                    </section>
                </main>
    
                <script>
                    const copyButton =
                        document.querySelector("#copyButton");
    
                    const jsonData =
                        document.querySelector("#jsonData");
    
                    // 복사 버튼에 복사 기능 리스너 추가.
                    copyButton.addEventListener("click", async () => {
                        try {
                            await navigator.clipboard.writeText(
                                jsonData.textContent
                            );
    
                            copyButton.textContent = "Copied!";
    
                            setTimeout(() => {
                                copyButton.textContent = "Copy";
                            }, 1500);
                        } catch (error) {
                            copyButton.textContent = "복사 실패";
                            console.error(error);
                        }
                    });
                </script>
            </body>
            </html>
                """;

        // 예쁜 출력 방식의 gson 라이브러리 사용
        Gson gson = new GsonBuilder()
                .setPrettyPrinting()
                .disableHtmlEscaping() // Gson의 \u003c 변환 비활성화 (자동 변환으로 출력하면 html태그가 문자열 자체로 출력되지 않음)
                .create();

        // user 리스트를 JSON 형식 문자열로 변환
        String userListJson = gson.toJson(copyUserList());

        // 이스케이프 문자 변환
        userListJson = escapeHtml(userListJson);

        // {{{ json_field }}}을 문자열로 치환
        html = html.replace("{{{ json_field }}}", userListJson);


        SimpleHttpServer.sendResponse(exchange, 200, SimpleHttpServer.TYPE_HTML, html);
    }

    /**

      이스케이프 문자 변환. 예를 들어 아래와 같은 해킹에 대한 보호.

     {
     "name": "</pre><script>alert('XSS')</script>"
     }

     */
    private String escapeHtml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }


    /**
     * POST 요청 : 요청 본문이(HTTP 요청 메세지 바디) 있다
     */
    private void handlePost(HttpExchange exchange) throws IOException {
        // 1. HTTP 요청 바디를 읽어야 한다.
        String requestBody = SimpleHttpServer.readRequestBody(exchange);
        System.out.println("POST 요청 [api/users] 받은 본문 확인 : " + requestBody);

        // 2. JSON 문자열을 User 객체로 변환한다.
        // 주의
        User user;
        try {
            user = new Gson().fromJson(requestBody, User.class);
        } catch (JsonSyntaxException e) {
            SimpleHttpServer.sendResponse(exchange, 400,
                    SimpleHttpServer.TYPE_TEXT, "JSON 형식이 올바르지 않습니다");
            return;
        }

        // 3. 검증
        if (user == null || user.getName() == null || user.getName().isBlank()) {
            SimpleHttpServer.sendResponse(exchange, 400,
                    SimpleHttpServer.TYPE_TEXT, "name 은 반드시 있어야 합니다");
            return;
        }

        if (user.getEmail() == null) {
            user.setEmail("");
        }

        // 4. 저장 처리 id 값은 고정값이 아니라서 저장 결과를 다시 돌려 준다.
        int newId = addUser(user);

        // 5. 등록 성공은 200 대신 201 Created 로 응답을 한다.
        SimpleHttpServer.sendJson(exchange, 201, user);
    }


} // end of class
