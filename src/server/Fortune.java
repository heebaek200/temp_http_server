package server;

import lombok.Data;

@Data
public class Fortune {
    private int fortuneId;
    String fortune;

    public Fortune(String fortune) {
        this.fortune = fortune;
    }
}
