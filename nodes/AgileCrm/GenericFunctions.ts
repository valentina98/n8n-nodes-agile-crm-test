import {
	OptionsWithUri
} from 'request';

import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import {
	IDataObject,
} from 'n8n-workflow';

import {IContactUpdate, IFilterRules, ISearchConditions} from './ContactInterface';

export async function agileCrmApiRequest(this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	method: string, endpoint: string, body: any = {}, query: IDataObject = {}, uri?: string, sendAsForm?: boolean): Promise<any> { // tslint:disable-line:no-any

	const credentials = await this.getCredentials('agileCrmApi');
	const options: OptionsWithUri = {
		method,
		headers: {
			'Accept': 'application/json',
		},
		auth: {
			username: credentials!.email as string,
			password: credentials!.apiKey as string,
		},
		qs: query,
		uri: uri || `https://${credentials!.subdomain}.agilecrm.com/dev/${endpoint}`,
		json: true,
	};

	// To send the request as 'content-type': 'application/x-www-form-urlencoded' add form to options instead of body
	if(sendAsForm) {
		options.form = body;
	}
	// Only add Body property if method not GET or DELETE to avoid 400 response
	// And when not sending a form
	else if (method !== 'GET' && method !== 'DELETE') {
		options.body = body;
	}

	try {
		return await this.helpers.request!(options);
	} catch (error) {
		throw new Error(error);
	}

}

export async function agileCrmApiRequestUpdate(this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions, method = 'PUT', endpoint?: string, body: any = {}, query: IDataObject = {}, uri?: string): Promise<any> { // tslint:disable-line:no-any

	const credentials = await this.getCredentials('agileCrmApi');
	const baseUri = `https://${credentials!.subdomain}.agilecrm.com/dev/`;
	const options: OptionsWithUri = {
		method,
		headers: {
			'Accept': 'application/json',
		},
		body: { id: body.id },
		auth: {
			username: credentials!.email as string,
			password: credentials!.apiKey as string,
		},
		uri: uri || baseUri,
		json: true,
	};

	const successfulUpdates = [];
	let lastSuccesfulUpdateReturn: any; // tslint:disable-line:no-any
	const payload: IContactUpdate = body;

	try {
		// Due to API, we must update each property separately. For user it looks like one seamless update
		if (payload.properties) {
			options.body.properties = payload.properties;
			options.uri = baseUri + 'api/contacts/edit-properties';
			lastSuccesfulUpdateReturn = await this.helpers.request!(options);

			// // Iterate trough properties and show them as individial updates instead of only vague "properties"
			// payload.properties?.map((property: any) => {
			// 	successfulUpdates.push(`${property.name}`);
			// });

			delete options.body.properties;
		}
		if (payload.lead_score) {
			options.body.lead_score = payload.lead_score;
			options.uri = baseUri + 'api/contacts/edit/lead-score';
			lastSuccesfulUpdateReturn = await this.helpers.request!(options);

			successfulUpdates.push('lead_score');

			delete options.body.lead_score;
		}
		if (body.tags) {
			options.body.tags = payload.tags;
			options.uri = baseUri + 'api/contacts/edit/tags';
			lastSuccesfulUpdateReturn = await this.helpers.request!(options);

			// payload.tags?.map((tag: string) => {
			// 	successfulUpdates.push(`(Tag) ${tag}`);
			// });

			delete options.body.tags;
		}
		if (body.star_value) {
			options.body.star_value = payload.star_value;
			options.uri = baseUri + 'api/contacts/edit/add-star';
			lastSuccesfulUpdateReturn = await this.helpers.request!(options);

			successfulUpdates.push('star_value');

			delete options.body.star_value;
		}

		return lastSuccesfulUpdateReturn;

	} catch (error) {
		throw new Error(error);
	}

}

export function validateJSON(json: string | undefined): any { // tslint:disable-line:no-any
	let result;
	try {
		result = JSON.parse(json!);
	} catch (exception) {
		result = undefined;
	}
	return result;
}

export function getRules(conditions: IDataObject): any { // tslint:disable-line:no-any
	const rules = [];

	for (const key in conditions) {
		if (conditions.hasOwnProperty(key)) {
			const searchConditions: ISearchConditions = conditions[key] as ISearchConditions;
			const rule: IFilterRules = {
				LHS: searchConditions.filterType,  // filter type
				CONDITION: searchConditions.searchOperation, // search operation
				RHS: searchConditions.value1 as string, // search value
			};
		rules.push(rule);
		}
	}

	return rules;
}