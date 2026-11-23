package com.projeto.emprestimo.service;

import com.projeto.exception.ConflitoException;
import com.projeto.exception.NaoEncontradoException;
import com.projeto.emprestimo.model.Equipamento;
import com.projeto.emprestimo.model.TipoEquipamento;
import com.projeto.emprestimo.repository.EmprestimoRepository;
import com.projeto.emprestimo.repository.EquipamentoRepository;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public class EquipamentoService {

    private final EquipamentoRepository equipamentoRepository;
    private final EmprestimoRepository emprestimoRepository;

    public EquipamentoService(
            EquipamentoRepository equipamentoRepository,
            EmprestimoRepository emprestimoRepository) {

        this.equipamentoRepository = equipamentoRepository;
        this.emprestimoRepository = emprestimoRepository;
    }

    public List<Equipamento> listar(
            TipoEquipamento tipo, Boolean disponivel) {

        if (tipo != null && disponivel != null) {
            return equipamentoRepository
                    .findByTipoAndDisponivel(tipo, disponivel);
        }

        if (tipo != null) {
            return equipamentoRepository.findByTipo(tipo);
        }

        if (disponivel != null) {
            return equipamentoRepository.findByDisponivel(disponivel);
        }

        return equipamentoRepository.findAll();
    }

    public Equipamento buscar(Long id){
        return equipamentoRepository.findById(id)
                .orElseThrow(()->
                        new NaoEncontradoException("Equipamento não encontrado"));
    }

    public Equipamento cadastrar (Equipamento equipamento){
        if (equipamentoRepository.existsByPatrimonio(equipamento.getPatrimonio())){
            throw new ConflitoException("Patrimônio já cadastrado");
        }
        equipamento.setDisponivel(true);

        return equipamentoRepository.save(equipamento);
    }
    public Equipamento atualizar(Long id, Equipamento dados){
        Equipamento equipamento = buscar(id);
        equipamento.setNome(dados.getNome());
        equipamento.setTipo(dados.getTipo());
        return equipamentoRepository.save(equipamento);

    }

    public void remover(Long id){
        Equipamento equipamento = buscar(id);
        if (emprestimoRepository.existsByEquipamentoId(id)){
            throw new ConflitoException("Equipamento possui histórico de empréstimos");
        }
        equipamentoRepository.delete(equipamento);

    }
}
