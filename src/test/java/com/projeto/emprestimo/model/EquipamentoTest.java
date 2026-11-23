package com.projeto.emprestimo.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EquipamentoTest {

    @Test
    void deveIniciarDisponivel() {

        Equipamento equipamento = new Equipamento();

        assertTrue(equipamento.isDisponivel());
    }

    @Test
    void deveFicarIndisponivelAoEmprestar() {

        Equipamento equipamento = new Equipamento();

        equipamento.emprestar();

        assertFalse(equipamento.isDisponivel());
    }

    @Test
    void naoDevePermitirEmprestarEquipamentoIndisponivel() {

        Equipamento equipamento = new Equipamento();

        equipamento.emprestar();

        assertThrows(
                IllegalStateException.class,
                equipamento::emprestar);
    }

    @Test
    void deveFicarDisponivelAposDevolucao() {

        Equipamento equipamento = new Equipamento();

        equipamento.emprestar();
        equipamento.devolver();

        assertTrue(equipamento.isDisponivel());
    }
}