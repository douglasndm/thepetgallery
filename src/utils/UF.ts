import i18n from '@app/i18n';

const ufToStateName: { [key: string]: string } = {
	AC: 'Acre',
	AL: 'Alagoas',
	AP: 'Amapá',
	AM: 'Amazonas',
	BA: 'Bahia',
	CE: 'Ceará',
	DF: 'Distrito Federal',
	ES: 'Espírito Santo',
	GO: 'Goiás',
	MA: 'Maranhão',
	MT: 'Mato Grosso',
	MS: 'Mato Grosso do Sul',
	MG: 'Minas Gerais',
	PA: 'Pará',
	PB: 'Paraíba',
	PR: 'Paraná',
	PE: 'Pernambuco',
	PI: 'Piauí',
	RJ: 'Rio de Janeiro',
	RN: 'Rio Grande do Norte',
	RS: 'Rio Grande do Sul',
	RO: 'Rondônia',
	RR: 'Roraima',
	SC: 'Santa Catarina',
	SP: 'São Paulo',
	SE: 'Sergipe',
	TO: 'Tocantins',
};

function convertUFToStateName(uf: string): string {
	// Converte a sigla para maiúsculas para garantir correspondência
	const normalizedUF = uf.toUpperCase();

	// Retorna o nome do estado ou um valor padrão se a sigla não for encontrada
	return ufToStateName[normalizedUF] || i18n.t('places.noState');
}

export { convertUFToStateName };
