package com.example.festival;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FestivalApplication {

	public static void main(String[] args) {
		SpringApplication.run(FestivalApplication.class, args);
	}

}
