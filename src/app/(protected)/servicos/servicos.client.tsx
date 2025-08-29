'use client';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { listServicosAction, createServicoAction } from './_actions';

interface Servico {
  id: string;
  nome: string;
  preco?: number;
  unidade_id: string;
}

const UNIDADE_DEMO = '550e8400-e29b-41d4-a716-446655440000';

export default function ServicosClient() {
  const [items, setItems] = useState<Servico[]>([]);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const result = await listServicosAction({ unidadeId: UNIDADE_DEMO });
      if (Array.isArray(result)) setItems(result as Servico[]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('nome', nome);
    fd.append('preco', preco || '0');
    fd.append('unidade_id', UNIDADE_DEMO);
    const result = await createServicoAction(fd);
    if ('success' in result && result.success) {
      setOpen(false);
      setNome('');
      setPreco('');
      await load();
    } else if ('success' in result) {
      console.error(result.error || result.errors);
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button variant="contained" onClick={() => setOpen(true)}>
          Novo Serviço
        </Button>
        {loading && <span>Carregando...</span>}
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Preço</TableCell>
            <TableCell>ID</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.nome}</TableCell>
              <TableCell>{typeof s.preco === 'number' ? s.preco : '-'}</TableCell>
              <TableCell>{s.id}</TableCell>
            </TableRow>
          ))}
          {!items.length && !loading && (
            <TableRow>
              <TableCell colSpan={3}>Nenhum serviço</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ component: 'form', onSubmit: handleCreate }}
      >
        <DialogTitle>Novo Serviço</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Preço"
            type="number"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={!nome.trim()}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
