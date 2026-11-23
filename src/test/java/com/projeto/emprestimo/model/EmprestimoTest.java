package com.projeto.emprestimo.model;

import com.projeto.exception.ConflitoException;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class EmprestimoTest {

    @Test
    void deveDefinirDataPrevistaPara14Dias() {

        Equipamento equipamento = new Equipamento();
        Colaborador colaborador = new Colaborador();
        LocalDate hoje = LocalDate.of(2026, 11, 21);

        Emprestimo emprestimo = new Emprestimo(
                equipamento, colaborador, hoje);

        assertEquals(hoje, emprestimo.getDataEmprestimo());
        assertEquals(
                hoje.plusDays(14),
                emprestimo.getDataPrevistaDevolucao());
    }

    @Test
    void deveGuardarEquipamentoEColaborador() {

        Equipamento equipamento = new Equipamento();
        Colaborador colaborador = new Colaborador();

        Emprestimo emprestimo = new Emprestimo(
                equipamento, colaborador, LocalDate.now());

        assertSame(equipamento, emprestimo.getEquipamento());
        assertSame(colaborador, emprestimo.getColaborador());
    }

    @Test
    void deveRegistrarDevolucao() {

        Emprestimo emprestimo = criarEmprestimo();
        LocalDate devolucao = LocalDate.of(2026, 11, 25);

        emprestimo.devolver(devolucao);

        assertEquals(devolucao, emprestimo.getDataDevolucao());
    }

    @Test
    void naoDevePermitirDevolucaoDuplicada() {

        Emprestimo emprestimo = criarEmprestimo();

        emprestimo.devolver(LocalDate.of(2026, 11, 25));

        assertThrows(
                ConflitoException.class,
                () -> emprestimo.devolver(
                        LocalDate.of(2026, 11, 26)));
    }

    @Test
    void deveIdentificarEmprestimoAtrasado() {

        Emprestimo emprestimo = criarEmprestimo();

        boolean atrasado = emprestimo.estaAtrasadoEm(
                LocalDate.of(2026, 12, 6));

        assertTrue(atrasado);
    }

    @Test
    void naoDeveConsiderarAtrasadoNoPrazo() {

        Emprestimo emprestimo = criarEmprestimo();

        boolean atrasado = emprestimo.estaAtrasadoEm(
                LocalDate.of(2026, 12, 5));

        assertFalse(atrasado);
    }

    @Test
    void naoDeveConsiderarAtrasadoAposDevolucao() {

        Emprestimo emprestimo = criarEmprestimo();

        emprestimo.devolver(LocalDate.of(2026, 11, 25));

        boolean atrasado = emprestimo.estaAtrasadoEm(
                LocalDate.of(2026, 12, 10));

        assertFalse(atrasado);
    }

    private Emprestimo criarEmprestimo() {

        Equipamento equipamento = new Equipamento();
        Colaborador colaborador = new Colaborador();

        return new Emprestimo(
                equipamento,
                colaborador,
                LocalDate.of(2026, 11, 21));
    }
}
