/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
// ErrorBoundary.js
import React from 'react';
import { Text, Button, StyleSheet, View, Platform } from 'react-native';
import { toast } from 'react-toastify';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para que da próxima vez o UI de fallback seja renderizado
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Você pode logar o erro em um serviço de relatórios de erros aqui
    console.error("ErrorBoundary capturou um erro", error, errorInfo);

    // Mostra um toast no modo web
    if (Platform.OS === 'web' && toast) {
      toast.error(`Ocorreu um erro: ${error.message}`);
    }
  }

  handleRetry = () => {
    // Reseta o estado de erro para tentar renderizar novamente
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Renderiza qualquer UI de fallback
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>Algo deu errado.</Text>
          {this.state.error && (
            <Text style={styles.errorDetails}>
              {this.state.error.toString()}
            </Text>
          )}
          <Button title="Tentar novamente" onPress={this.handleRetry} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 20,
    marginBottom: 10,
    color: 'red',
  },
  errorDetails: {
    fontSize: 14,
    marginBottom: 20,
    color: 'gray',
  },
});

export default ErrorBoundary;
