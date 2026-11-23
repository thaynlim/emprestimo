package com.projeto.emprestimo.controller;

import com.projeto.emprestimo.dto.LoginRequest;
import com.projeto.emprestimo.dto.TokenResposta;
import com.projeto.emprestimo.security.TokenService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public AuthController(AuthenticationManager authenticationManager, TokenService tokenService) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    @PostMapping("/login")
    public TokenResposta login(@RequestBody LoginRequest dados) {

        if (dados == null || dados.usuario() == null || dados.senha() == null) {
            throw new BadCredentialsException("Credenciais inválidas");
        }

        Authentication autenticacao = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(dados.usuario(), dados.senha()));

        String perfil = autenticacao.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .filter(autoridade -> autoridade.startsWith("ROLE_"))
                .map(autoridade -> autoridade.substring(5))
                .findFirst()
                .orElseThrow(() ->
                        new BadCredentialsException("Perfil não encontrado"));

        String token = tokenService.gerarToken(autenticacao.getName(), perfil);
        return new TokenResposta(token);


    }
}

