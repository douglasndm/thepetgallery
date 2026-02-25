import i18n from '@app/i18n';

function organizeData(places: IAdoptionPlace[]): GroupedAdoptionPlace {
	const groupedData: GroupedAdoptionPlace = {};

	// Separar os itens com e sem UF
	const itemsWithUF = places.filter(item => item.UF);
	const itemsWithoutUF = places.filter(item => !item.UF);

	// Agrupar por UF
	itemsWithUF.forEach(item => {
		const uf = item.UF!; // Garantimos que item.uf existe aqui
		if (!groupedData[uf]) {
			groupedData[uf] = { withCity: [], withoutCity: [] };
		}
		if (item.city || item.City) {
			item.city = item.city || item.City;

			groupedData[uf].withCity.push(item);
		} else {
			groupedData[uf].withoutCity.push(item);
		}
	});

	// Adicionar os itens sem UF no final
	groupedData[i18n.t('places.withoutUF')] = {
		withCity: [],
		withoutCity: itemsWithoutUF,
	};

	return groupedData;
}

export { organizeData };
