package com.projeto.emprestimo.model;

import com.projeto.exception.ConflitoException;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.lang.Exception;

@Entity
public class Emprestimo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Equipamento equipamento;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Colaborador colaborador;

    private LocalDate dataEmprestimo;
    private LocalDate dataPrevistaDevolucao;
    private LocalDate dataDevolucao;

    public Emprestimo() {
    }

    public Emprestimo(Equipamento equipamento, Colaborador colaborador, LocalDate hoje) {
        this.equipamento = equipamento;
        this.colaborador = colaborador;
        this.dataEmprestimo = hoje;
        this.dataPrevistaDevolucao = hoje.plusDays(14);
    }

    public Long getId() {
        return id;
    }

    public Equipamento getEquipamento() {
        return equipamento;
    }

    public Colaborador getColaborador() {
        return colaborador;
    }

    public LocalDate getDataEmprestimo() {
        return dataEmprestimo;
    }

    public LocalDate getDataPrevistaDevolucao() {
        return dataPrevistaDevolucao;
    }

    public LocalDate getDataDevolucao() {
        return dataDevolucao;
    }

    public void devolver(LocalDate data) {
        if (dataDevolucao != null) {
            throw new ConflitoException("Empréstimo já devolvido");
        }
        this.dataDevolucao = data;
    }

    public boolean estaAtrasadoEm(LocalDate data) {
        return dataDevolucao == null
                && dataPrevistaDevolucao.isBefore(data);
    }

    public boolean isAtrasado() {
        return dataDevolucao == null
                && dataPrevistaDevolucao
                .isBefore(LocalDate.now());
    }
}
