package server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class FortuneApiHandler implements HttpHandler {

    private static final List<Fortune> fortuneList = new ArrayList<>();
    private static int nextId = 1;
    //내용 : 오늘의 운세를 무작위 출력

    static {
        addFortune(new Fortune("✨ 오늘은 예상치 못한 행운이 찾아와요"));
        addFortune(new Fortune("🍀 소소하지만 확실한 행복이 있는 하루"));
        addFortune(new Fortune("☔ 오늘은 조심, 조심! 신중하게 행동하세요"));
        addFortune(new Fortune("🌟 하늘이 도와주는 천운의 날"));
        addFortune(new Fortune("🎉 뜻밖의 대박 찬스가 찾아옵니다"));
        addFortune(new Fortune("🐨 여유롭게, 느긋한 마음으로 보내는 하루"));
        addFortune(new Fortune("🐰 발걸음이 가벼운, 순조로운 하루"));
        addFortune(new Fortune("☁️ 마음을 비우면 답이 보이는 날"));
        addFortune(new Fortune("🐯 용기를 내면 좋은 결과가 따르는 하루"));
        addFortune(new Fortune("🥬 사소한 것에서 큰 기쁨을 찾는 날"));
        addFortune(new Fortune("🌶️ 매콤한 자극이 필요한, 활력 넘치는 하루"));
        addFortune(new Fortune("🤝 좋은 인연을 만날 수 있는 하루"));
        addFortune(new Fortune("📚 배움과 깨달음이 가득한 하루"));
        addFortune(new Fortune("🔺 차근차근 쌓아올린 노력이 빛나는 날"));
        addFortune(new Fortune("😄 웃을 일이 많이 생기는 유쾌한 하루"));
        addFortune(new Fortune("🔮 예감이 딱 들어맞는 신비한 하루"));

    }

    private static synchronized int addFortune(Fortune fortune) {
        fortune.setFortuneId(nextId);
        nextId++;
        fortuneList.add(fortune);
        return fortune.getFortuneId();
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {

            if (fortuneList.isEmpty() || fortuneList == null) {
                SimpleHttpServer.sendResponse(exchange,404,SimpleHttpServer.TYPE_TEXT,"포춘 쿠키 목록이 비어있습니다.");
                return;
            }

            Random random = new Random();
            int i = random.nextInt(fortuneList.size());

            SimpleHttpServer.sendResponse(exchange,200,SimpleHttpServer.TYPE_TEXT,fortuneList.get(i).getFortune());

        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            exchange.close();
        }



    }
}

