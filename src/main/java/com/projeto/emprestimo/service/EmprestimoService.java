package com.projeto.emprestimo.service;

import com.projeto.exception.ConflitoException;
import com.projeto.exception.NaoEncontradoException;
import com.projeto.emprestimo.model.Colaborador;
import com.projeto.emprestimo.model.Emprestimo;
import com.projeto.emprestimo.model.Equipamento;
import com.projeto.emprestimo.repository.ColaboradorRepository;
import com.projeto.emprestimo.repository.EmprestimoRepository;
import com.projeto.emprestimo.repository.EquipamentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDate;
import java.util.List;

@Service
public class EmprestimoService {
    private final EmprestimoRepository emprestimoRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final ColaboradorRepository colaboradorRepository;

    public EmprestimoService(
            EmprestimoRepository emprestimoRepository,
            EquipamentoRepository equipamentoRepository,
            ColaboradorRepository colaboradorRepository){

        this.emprestimoRepository = emprestimoRepository;
        this.equipamentoRepository = equipamentoRepository;
        this.colaboradorRepository = colaboradorRepository;
    }

    public List<Emprestimo> listar(Boolean atrasados){

        if (Boolean.TRUE.equals(atrasados)){
            return emprestimoRepository
                    .findByDataDevolucaoIsNullAndDataPrevistaDevolucaoBefore(
                            LocalDate.now());
        }
        return emprestimoRepository.findAll();
    }

    public Emprestimo buscar(Long id) {
        return emprestimoRepository.findById(id)
                .orElseThrow(() ->
                        new NaoEncontradoException("Empréstimo não encontrado"));
    }
    public List<Emprestimo> listarDoColaborador(Long colaboradorId) {
        return emprestimoRepository.findByColaboradorId(colaboradorId);
    }

    @Transactional
    public Emprestimo emprestar(Long equipamentoId, Long colaboradorId) {

        Equipamento equipamento = equipamentoRepository
                .findById(equipamentoId)
                .orElseThrow(() -> new NaoEncontradoException("Equipamento não encontrado"));

        Colaborador colaborador = colaboradorRepository
                .findById(colaboradorId)
                .orElseThrow(() ->
                        new NaoEncontradoException("Colaborador não encontrado"));


        boolean temAtraso = emprestimoRepository
                .existsByColaboradorIdAndDataDevolucaoIsNullAndDataPrevistaDevolucaoBefore(colaboradorId, LocalDate.now());

        if (temAtraso) {
            throw new ConflitoException("Colaborador possui empréstimo atrasado");
        }
        if (!equipamento.isDisponivel()) {
            throw new ConflitoException("Equipamento indisponível");
        }
        equipamento.emprestar();

        Emprestimo emprestimo = new Emprestimo(equipamento, colaborador, LocalDate.now());

        equipamentoRepository.save(equipamento);

        return emprestimoRepository.save(emprestimo);
    }

    @Transactional
    public Emprestimo devolver(Long id){

        Emprestimo emprestimo = buscar(id);

        if (emprestimo.getDataDevolucao() !=null){
            throw new ConflitoException("Empréstimo já devolvido");
        }
        emprestimo.devolver(LocalDate.now());

        Equipamento equipamento = emprestimo.getEquipamento();

        equipamento.devolver();
        equipamentoRepository.save(equipamento);

        return emprestimoRepository.save(emprestimo);
    }

}
