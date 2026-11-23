package com.projeto.emprestimo.controller;

import com.projeto.emprestimo.security.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EquipamentoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TokenService tokenService;

    @Test
    void deveCadastrarEquipamento() throws Exception {

        String patrimonio = "TESTE-MOCKMVC-001";

        String json = """
                {
                  "patrimonio": "%s",
                  "nome": "Notebook de teste",
                  "tipo": "NOTEBOOK"
                }
                """.formatted(patrimonio);

        String token = tokenService.gerarToken("admin", "ADMIN");

        Object MediaType = null;
        mockMvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                                .post("/equipamentos")
                        .header("Authorization", "Bearer " + token)
                                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated());
    }
    private org.springframework.test.web.servlet.result.MockMvcResultMatchers post(String s) {
        return null;
    }
    @Test
    void deveRetornar404QuandoEquipamentoNaoExiste() throws Exception {

        String token = tokenService.gerarToken("admin", "ADMIN");

        mockMvc.perform(get("/equipamentos/999999999")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message")
                        .value("Equipamento não encontrado"));
    }
}
