import { IExecuteFunctions } from 'n8n-core';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	contactFields,
	contactOperations
} from './ContactDescription';

import {
	companyFields,
	companyOperations
} from './CompanyDescription';

import {
	dealFields,
	dealOperations
} from './DealDescription';

import {
	IContact, 
	IContactUpdate, 
	IFilter, 
	ISearchConditions
} from './ContactInterface';

import {
	agileCrmApiRequest,
	agileCrmApiRequestUpdate, 

	getRules,
	validateJSON
} from './GenericFunctions';

import { IDeal } from './DealInterface';


export class AgileCrm implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Agile CRM',
		name: 'agileCrm',
		icon: 'file:agilecrm.png',
		group: ['transform'],
		version: 1,
		description: 'Consume Agile CRM API',
		defaults: {
			name: 'AgileCRM',
			color: '#772244',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'agileCrmApi',
				required: true,
			},
		],
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Company',
						value: 'company',
					},
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Deal',
						value: 'deal',
					},
				],
				default: 'contact',
				description: 'Resource to consume.',
			},
			// CONTACT
			...contactOperations,
			...contactFields,

			// COMPANY
			...companyOperations,
			...companyFields,

			// DEAL
			...dealOperations,
			...dealFields,
		],

	};


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		let responseData;
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {

			if (resource === 'contact' || resource === 'company') {
				const idGetter = resource === 'contact' ? 'contactId' : 'companyId';

				if (operation === 'get') {
					const contactId = this.getNodeParameter(idGetter, i) as string;

					const endpoint = `api/contacts/${contactId}`;
					responseData = await agileCrmApiRequest.call(this, 'GET', endpoint, {});

				} else if (operation === 'delete') {
					const contactId = this.getNodeParameter(idGetter, i) as string;

					const endpoint = `api/contacts/${contactId}`;
					responseData = await agileCrmApiRequest.call(this, 'DELETE', endpoint, {});

				} else if (operation === 'getAll') {
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;

					if(!returnAll) {
						// If search conditions are added build the rules json according to: <https://github.com/agilecrm/rest-api#devapifiltersfilterdynamic-filter>
						const conditions = this.getNodeParameter('searchConditions.conditions', i) as IDataObject;

						if (conditions) {//Object.keys(conditions).length !== 0

							let contactType = '';
							if (resource === 'contact') {
								contactType = 'PERSON';
							} else { // resource === 'company'
								contactType = 'COMPANY';
							}
							
							const filter: IFilter = { contact_type: contactType };
							
							const combineOperation = this.getNodeParameter('combineOperation', i) as string;
							const rules: IDataObject = getRules(conditions);
							if (combineOperation === "any") {
								filter.or_rules = rules;
							} else { // if === "all"
								filter.rules = rules;
							}

							const filterJson = JSON.stringify(filter);
							const endpoint = `api/filters/filter/dynamic-filter`;
							const limit = this.getNodeParameter('limit', i) as number;
							const sortCriteria = this.getNodeParameter('sortCriteria', i) as IDataObject;
							const body: IDataObject = {
								filterJson,
								page_size: limit,
								global_sort_key: sortCriteria,
							};

							// Send request with sendAsForm set to true
							responseData = await agileCrmApiRequest.call(this, 'POST', endpoint, body, undefined, undefined, true);

						}
						// If no search conditions are added use the get all endpoint
						else {
							if (resource === 'contact') {
								const limit = this.getNodeParameter('limit', i) as number;
								const endpoint = `api/contacts?page_size=${limit}`;
								responseData = await agileCrmApiRequest.call(this, 'GET', endpoint, {});

							} else { // resource === 'company'
								const limit = this.getNodeParameter('limit', i) as number;
								const endpoint = `api/contacts/companies/list?page_size=${limit}`;
								responseData = await agileCrmApiRequest.call(this, 'POST', endpoint, {});
							}
						}
					}
					else { // if returnAll

						if (resource === 'contact') {
							const endpoint = 'api/contacts';
							responseData = await agileCrmApiRequest.call(this, 'GET', endpoint, {});

						} else {
							const endpoint = 'api/contacts/companies/list';
							responseData = await agileCrmApiRequest.call(this, 'POST', endpoint, {});
						}
					}

				} else if (operation === 'create') {
					const jsonParameters = this.getNodeParameter('jsonParameters', i) as boolean;
					const body: IContact = {};
					const properties: IDataObject[] = [];

					if (jsonParameters) {
						const additionalFieldsJson = this.getNodeParameter('additionalFieldsJson', i) as string;

						if (additionalFieldsJson !== '') {

							if (validateJSON(additionalFieldsJson) !== undefined) {

								Object.assign(body, JSON.parse(additionalFieldsJson));

							} else {
								throw new Error('Additional fields must be a valid JSON');
							}
						}

					} else {

						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						// if company, add 'company' as type. default is person
						if (resource === 'company') {
							body.type = 'COMPANY';
						}
						if (additionalFields.starValue) {
							body.star_value = additionalFields.starValue as string;
						}
						if (additionalFields.tags) {
							body.tags = additionalFields.tags as string[];
						}

						// Contact specific properties
						if (resource === 'contact') {
							if (additionalFields.firstName) {
								properties.push({
									type: 'SYSTEM',
									name: 'first_name',
									value: additionalFields.firstName as string,
								} as IDataObject);
							}
							if (additionalFields.lastName) {
								properties.push({
									type: 'SYSTEM',
									name: 'last_name',
									value: additionalFields.lastName as string,
								} as IDataObject);
							}
							if (additionalFields.company) {
								properties.push({
									type: 'SYSTEM',
									name: 'company',
									value: additionalFields.company as string,
								} as IDataObject);
							}
							if (additionalFields.title) {
								properties.push({
									type: 'SYSTEM',
									name: 'title',
									value: additionalFields.title as string,
								} as IDataObject);
							}
							if (additionalFields.emailOptions) {
								//@ts-ignore
								additionalFields.emailOptions.emailProperties.map(property => {
									properties.push({
										type: 'SYSTEM',
										subtype: property.subtype as string,
										name: 'email',
										value: property.email as string,
									} as IDataObject);
								});
							}
							if (additionalFields.addressOptions) {
								//@ts-ignore
								additionalFields.addressOptions.addressProperties.map(property => {
									properties.push({
										type: 'SYSTEM',
										subtype: property.subtype as string,
										name: 'address',
										value: property.address as string,
									} as IDataObject);
								});
							}

							if (additionalFields.phoneOptions) {
								//@ts-ignore
								additionalFields.phoneOptions.phoneProperties.map(property => {
									properties.push({
										type: 'SYSTEM',
										subtype: property.subtype as string,
										name: 'phone',
										value: property.number as string,
									} as IDataObject);
								});
							}
						} else if (resource === 'company') {
							if (additionalFields.email) {
								properties.push({
									type: 'SYSTEM',
									name: 'email',
									value: additionalFields.email as string,
								} as IDataObject);
							}

							if (additionalFields.address) {
								properties.push({
									type: 'SYSTEM',
									name: 'address',
									value: additionalFields.address as string,
								} as IDataObject);
							}

							if (additionalFields.phone) {
								properties.push({
									type: 'SYSTEM',
									name: 'phone',
									value: additionalFields.phone as string,
								} as IDataObject);
							}

						}

						if (additionalFields.websiteOptions) {
							//@ts-ignore
							additionalFields.websiteOptions.websiteProperties.map(property => {
								properties.push({
									type: 'SYSTEM',
									subtype: property.subtype as string,
									name: 'webiste',
									value: property.url as string,
								} as IDataObject);
							});
						}

						if (additionalFields.customProperties) {
							//@ts-ignore
							additionalFields.customProperties.customProperty.map(property => {
								properties.push({
									type: 'CUSTOM',
									subtype: property.subtype as string,
									name: property.name,
									value: property.value as string,
								} as IDataObject);
							});
						}
						body.properties = properties;

					}
					const endpoint = 'api/contacts';
					responseData = await agileCrmApiRequest.call(this, 'POST', endpoint, body);

				} else if (operation === 'update') {
					const contactId = this.getNodeParameter(idGetter, i) as string;
					const contactUpdatePayload: IContactUpdate = { id: contactId };
					const jsonParameters = this.getNodeParameter('jsonParameters', i) as boolean;
					const body: IContact = {};
					const properties: IDataObject[] = [];

					if (jsonParameters) {
						const additionalFieldsJson = this.getNodeParameter('additionalFieldsJson', i) as string;

						if (additionalFieldsJson !== '') {

							if (validateJSON(additionalFieldsJson) !== undefined) {

								Object.assign(body, JSON.parse(additionalFieldsJson));

							} else {
								throw new Error('Additional fields must be a valid JSON');
							}
						}
					} else {
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						if (additionalFields.starValue) {
							body.star_value = additionalFields.starValue as string;
						}
						if (additionalFields.tags) {
							body.tags = additionalFields.tags as string[];
						}

						// Contact specific properties
						if (resource === 'contact') {

							if (additionalFields.leadScore) {
								body.lead_score = additionalFields.leadScore as string;
							}

							if (additionalFields.firstName) {
								properties.push({
									type: 'SYSTEM',
									name: 'first_name',
									value: additionalFields.firstName as string,
								} as IDataObject);
							}
							if (additionalFields.lastName) {
								properties.push({
									type: 'SYSTEM',
									name: 'last_name',
									value: additionalFields.lastName as string,
								} as IDataObject);
							}
							if (additionalFields.company) {
								properties.push({
									type: 'SYSTEM',
									name: 'company',
									value: additionalFields.company as string,
								} as IDataObject);
							}
							if (additionalFields.title) {
								properties.push({
									type: 'SYSTEM',
									name: 'title',
									value: additionalFields.title as string,
								} as IDataObject);
							}
							if (additionalFields.emailOptions) {
								//@ts-ignore
								additionalFields.emailOptions.emailProperties.map(property => {
									properties.push({
										type: 'SYSTEM',
										subtype: property.subtype as string,
										name: 'email',
										value: property.email as string,
									} as IDataObject);
								});
							}
							if (additionalFields.addressOptions) {
								//@ts-ignore
								additionalFields.addressOptions.addressProperties.map(property => {
									properties.push({
										type: 'SYSTEM',
										subtype: property.subtype as string,
										name: 'address',
										value: property.address as string,
									} as IDataObject);
								});
							}

							if (additionalFields.phoneOptions) {
								//@ts-ignore
								additionalFields.phoneOptions.phoneProperties.map(property => {
									properties.push({
										type: 'SYSTEM',
										subtype: property.subtype as string,
										name: 'phone',
										value: property.number as string,
									} as IDataObject);
								});
							}
						} else if (resource === 'company') {
							if (additionalFields.email) {
								properties.push({
									type: 'SYSTEM',
									name: 'email',
									value: additionalFields.email as string,
								} as IDataObject);
							}

							if (additionalFields.address) {
								properties.push({
									type: 'SYSTEM',
									name: 'address',
									value: additionalFields.address as string,
								} as IDataObject);
							}

							if (additionalFields.phone) {
								properties.push({
									type: 'SYSTEM',
									name: 'phone',
									value: additionalFields.phone as string,
								} as IDataObject);
							}

						}

						if (additionalFields.websiteOptions) {
							//@ts-ignore
							additionalFields.websiteOptions.websiteProperties.map(property => {
								properties.push({
									type: 'SYSTEM',
									subtype: property.subtype as string,
									name: 'webiste',
									value: property.url as string,
								} as IDataObject);
							});
						}
						if (additionalFields.customProperties) {
							//@ts-ignore
							additionalFields.customProperties.customProperty.map(property => {
								properties.push({
									type: 'CUSTOM',
									subtype: property.subtype as string,
									name: property.name,
									value: property.value as string,
								} as IDataObject);
							});
						}
						body.properties = properties;
					}

					Object.assign(contactUpdatePayload, body);

					responseData = await agileCrmApiRequestUpdate.call(this, 'PUT', '', contactUpdatePayload);

				}

			} else if (resource === 'deal') {

				if (operation === 'get') {
					const dealId = this.getNodeParameter('dealId', i) as string;

					const endpoint = `api/opportunity/${dealId}`;
					responseData = await agileCrmApiRequest.call(this, 'GET', endpoint, {});

				} else if (operation === 'delete') {
					const contactId = this.getNodeParameter('dealId', i) as string;

					const endpoint = `api/opportunity/${contactId}`;
					responseData = await agileCrmApiRequest.call(this, 'DELETE', endpoint, {});

				} else if (operation === 'getAll') {
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;

					if (returnAll) {
						const endpoint = 'api/opportunity';
						responseData = await agileCrmApiRequest.call(this, 'GET', endpoint, {});
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						const endpoint = `api/opportunity?page_size=${limit}`;
						responseData = await agileCrmApiRequest.call(this, 'GET', endpoint, {});
					}

				} else if (operation === 'create') {
					const jsonParameters = this.getNodeParameter('jsonParameters', i) as boolean;

					const body: IDeal = {};

					if (jsonParameters) {
						const additionalFieldsJson = this.getNodeParameter('additionalFieldsJson', i) as string;

						if (additionalFieldsJson !== '') {
							if (validateJSON(additionalFieldsJson) !== undefined) {
								Object.assign(body, JSON.parse(additionalFieldsJson));
							} else {
								throw new Error('Additional fields must be a valid JSON');
							}
						}

					} else {
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						body.close_date = new Date(this.getNodeParameter('closeDate', i) as string).getTime();
						body.expected_value = this.getNodeParameter('expectedValue', i) as number;
						body.milestone = this.getNodeParameter('milestone', i) as string;
						body.probability = this.getNodeParameter('probability', i) as number;
						body.name = this.getNodeParameter('name', i) as string;

						if (additionalFields.contactIds) {
							body.contactIds = additionalFields.contactIds as string[];
						}

						if (additionalFields.customData) {
							// @ts-ignore
							body.customData = additionalFields.customData.customProperty as IDealCustomProperty[];
						}

					}

					const endpoint = 'api/opportunity';
					responseData = await agileCrmApiRequest.call(this, 'POST', endpoint, body);

				} else if (operation === 'update') {
					const jsonParameters = this.getNodeParameter('jsonParameters', i) as boolean;

					const body: IDeal = {};

					if (jsonParameters) {
						const additionalFieldsJson = this.getNodeParameter('additionalFieldsJson', i) as string;

						if (additionalFieldsJson !== '') {

							if (validateJSON(additionalFieldsJson) !== undefined) {

								Object.assign(body, JSON.parse(additionalFieldsJson));

							} else {
								throw new Error('Additional fields must be valid JSON');
							}
						}

					} else {
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						body.id = this.getNodeParameter('dealId', i) as number;

						if (additionalFields.expectedValue) {
							body.expected_value = additionalFields.expectedValue as number;
						}

						if (additionalFields.name) {
							body.name = additionalFields.name as string;
						}

						if (additionalFields.probability) {
							body.probability = additionalFields.probability as number;
						}

						if (additionalFields.contactIds) {
							body.contactIds = additionalFields.contactIds as string[];
						}

						if (additionalFields.customData) {
							// @ts-ignore
							body.customData = additionalFields.customData.customProperty as IDealCustomProperty[];
						}

					}

					const endpoint = 'api/opportunity/partial-update';
					responseData = await agileCrmApiRequest.call(this, 'PUT', endpoint, body);
				}
			}

			if (Array.isArray(responseData)) {
				returnData.push.apply(returnData, responseData as IDataObject[]);
			} else {
				returnData.push(responseData as IDataObject);
			}

		}

		return [this.helpers.returnJsonArray(returnData)];
	}

}
