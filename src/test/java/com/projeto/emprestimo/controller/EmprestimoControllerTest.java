package com.projeto.emprestimo.controller;

import com.projeto.emprestimo.model.Colaborador;
import com.projeto.emprestimo.model.Emprestimo;
import com.projeto.emprestimo.model.Equipamento;
import com.projeto.emprestimo.model.TipoEquipamento;
import com.projeto.emprestimo.repository.ColaboradorRepository;
import com.projeto.emprestimo.repository.EmprestimoRepository;
import com.projeto.emprestimo.repository.EquipamentoRepository;
import com.projeto.emprestimo.security.TokenService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EmprestimoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private EmprestimoRepository emprestimoRepository;

    @Autowired
    private EquipamentoRepository equipamentoRepository;

    @Autowired
    private ColaboradorRepository colaboradorRepository;

    @Test
    void deveListarEmprestimos() throws Exception {

        String token = tokenService.gerarToken("admin", "ADMIN");

        mockMvc.perform(get("/emprestimos")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void deveRetornar404QuandoEmprestimoNaoExiste() throws Exception {

        String token = tokenService.gerarToken("admin", "ADMIN");

        mockMvc.perform(get("/emprestimos/999999999")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message")
                        .value("Empréstimo não encontrado"));
    }

    @Test
    void deveRetornar409AoDevolverDuasVezes() throws Exception {

        String token = tokenService.gerarToken("admin", "ADMIN");
        String codigo = UUID.randomUUID().toString();

        Equipamento equipamento = new Equipamento();
        equipamento.setNome("Notebook de teste");
        equipamento.setPatrimonio("TESTE-" + codigo);
        equipamento.setTipo(TipoEquipamento.NOTEBOOK);
        equipamento.setDisponivel(false);

        equipamento = equipamentoRepository.save(equipamento);

        Colaborador colaborador = new Colaborador();
        colaborador.setNome("Colaborador de teste");
        colaborador.setEmail("teste-" + codigo + "@email.com");

        colaborador = colaboradorRepository.save(colaborador);

        Emprestimo emprestimo = new Emprestimo(
                equipamento,
                colaborador,
                LocalDate.now()
        );

        emprestimo = emprestimoRepository.save(emprestimo);

        Long id = emprestimo.getId();

        mockMvc.perform(put("/emprestimos/{id}/devolucao", id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(put("/emprestimos/{id}/devolucao", id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("Empréstimo já devolvido"));
    }
}
