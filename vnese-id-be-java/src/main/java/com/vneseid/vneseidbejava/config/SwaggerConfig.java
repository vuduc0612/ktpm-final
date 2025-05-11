package com.vneseid.vneseidbejava.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components())
                .info(new Info()
                        .title("Vietnamese ID Management API")
                        .description("API for Vietnamese ID management including dataset upload for YOLO training. "
                                + "For uploading multiple files, please use the custom HTML form at: "
                                + "http://localhost:8080/ instead of this Swagger UI.")
                        .version("1.0.0")
                        .license(new License().name("Private").url(""))
                );
    }
}
