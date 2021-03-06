import {
	INodeProperties,
} from 'n8n-workflow';
export const companyOperations = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [
					'company',
				],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new company',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a company',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a company',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all companies',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update company properties',
			},
		],
		default: 'get',
		description: 'The operation to perform.',
	},
] as INodeProperties[];
export const companyFields = [
	/* -------------------------------------------------------------------------- */
	/*                                  company:get                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Company ID',
		name: 'companyId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'company',
				],
				operation: [
					'get',
				],
			},
		},
		default: '',
		description: 'Unique identifier for a particular company',
	},

	/* -------------------------------------------------------------------------- */
	/*                                  company:get all                           */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Search Conditions',
		name: 'searchConditions',
		placeholder: 'Add Condition',
		type: 'fixedCollection',
		displayOptions: {
			show: {
				resource: [
					'company',
				],
				operation: [
					'getAll',
				],
				returnAll: [
					false,
				],
			},
		},
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		description: 'The conditions to search by.',
		default: {
			conditions: { conditions:[] },
		},
		options: [
			{
				displayName: 'Conditions',
				name: 'conditions',
				values: [
					{
						displayName: 'Filter Type',
						name: 'filterType',
						type: 'options',
							options: [
								{
									name: 'Email',
									value: 'email',
								},
								{
									name: 'Name',
									value: 'name',
								},
								{
									name: 'Tags',
									value: 'tags',
								},
							],
						default: 'email',
						description: 'Type of searching.',
					},
					{
						displayName: 'Search Operation',
						name: 'searchOperation',
						type: 'options',
						options: [
							{
								name: 'Equals',
								value: 'EQUALS',
								description: 'Equal to the value..',
							},
							{
								name: "Doesn't equal",
								value: 'NOTEQUALS',
								description: 'Not equal to the value.',
							},
						],
						default: 'EQUALS',
						description: 'Operation to decide how the data should be searched.',
					},
					{
						displayName: 'Value',
						name: 'value1',
						type: 'string',
						default: '',
						description: '',
					},
				],
			},
		],
	},
	{
		displayName: 'Combine',
		name: 'combineOperation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [
					'company',
				],
				operation: [
					'getAll',
				],
				returnAll: [
					false,
				],
			},
		},
		options: [
			{
				name: 'ALL',
				description: 'If all conditions are met it goes into "true" branch.',
				value: 'all',
			},
			{
				name: 'ANY',
				description: 'If any of the conditions is met it goes into "true" branch.',
				value: 'any',
			},
		],
		default: 'all',
		description: 'If multiple rules got set this settings decides if it is true as soon as ANY condition matches or only if ALL get met.',
	},
	{
		displayName: 'Sort Criteria',
		name: 'sortCriteria',
		type: 'options',
		displayOptions: {
			show: {
				resource: [
					'company',
				],
				operation: [
					'getAll',
				],
			},
		},
		options: [
			{
				name: 'Time of edit ascending',
				value: 'updated_time',
			},
			{
				name: 'Time of edit descending',
				value: '-updated_time',
			},
			{
				name: 'Time of creation ascending',
				value: 'created_time',
			},
			{
				name: 'Time of creation descending',
				value: '-created_time',
			},
		],
		default: '-updated_time',
		description: 'The criteria to sort by.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: [
					'company',
				],
				operation: [
					'getAll',
				],
				returnAll: [
					false,
				],
			},
		},
		default: 20,
		description: 'Number of results to fetch.',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: [
					'company',
				],
				operation: [
					'getAll',
				],
			},
		},
		default: false,
		description: 'If all results should be returned or only up to a given limit.',
	},

	/* -------------------------------------------------------------------------- */
	/*                                company:create                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'JSON Parameters',
		name: 'jsonParameters',
		type: 'boolean',
		default: false,
		description: '',
		displayOptions: {
			show: {
				resource: [
					'company',
				],
				operation: [
					'create',
				],
			},
		},
	},
	{
		displayName: ' Additional Fields',
		name: 'additionalFieldsJson',
		type: 'json',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		default: '',
		displayOptions: {
			show: {
				resource: [
					'company',
				],
				operation: [
					'create',
				],
				jsonParameters: [
					true,
				],
			},
		},
		description: 'Object of values to set as described <a href="https://github.com/agilecrm/rest-api#1-companys---companies-api">here</a>.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [
					'company',
				],
				operation: [
					'create',
				],
				jsonParameters: [
					false,
				],
			},
		},
		options: [
			{
				displayName: 'Address',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Company address.',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Company email.',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Company name.',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Company phone.',
			},
			{
				displayName: 'Star Value',
				name: 'starValue',
				type: 'options',
				default: '',
				description: 'Rating of company (Max value 5). This is not applicable for companies.',
				options: [
					{
						name: '0',
						value: 0,
					},
					{
						name: '1',
						value: 1,
					},
					{
						name: '2',
						value: 2,
					},
					{
						name: '3',
						value: 3,
					},
					{
						name: '4',
						value: 4,
					},
					{
						name: '5',
						value: 5,
					},
				],
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Tag',
				},
				default: [],
				description: 'Unique identifiers added to company, for easy management of companys. This is not applicable for companies.',
			},
			{
				displayName: 'Website',
				name: 'websiteOptions',
				type: 'fixedCollection',
				description: 'Companies websites.',
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						displayName: 'Website properties.',
						name: 'websiteProperties',
						values: [
							{
								displayName: 'Type',
								name: 'subtype',
								type: 'options',
								required: true,
								default: '',
								description: 'Type of website.',
								options: [
									{
										name: 'Facebook',
										value: 'facebook',
									},
									{
										name: 'Feed',
										value: 'feed',
									},
									{
										name: 'Flickr',
										value: 'flickr',
									},
									{
										name: 'Github',
										value: 'github',
									},
									{
										name: 'Google Plus',
										value: 'googlePlus',
									},
									{
										name: 'LinkedIn',
										value: 'linkedin',
									},
									{
										name: 'Skype',
										value: 'skype',
									},
									{
										name: 'Twitter',
										value: 'twitter',
									},
									{
										name: 'URL',
										value: 'url',
									},
									{
										name: 'Xing',
										value: 'xing',
									},
									{
										name: 'YouTube',
										value: 'youtube',
									},
								],
							},
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								required: true,
								default: '',
								description: 'Website URL',
							},
						],
					},
				],
			},
			{
				displayName: 'Custom Properties',
				name: 'customProperties',
				type: 'fixedCollection',
				description: 'Custom Properties',
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						displayName: 'Property',
						name: 'customProperty',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								required: true,
								default: '',
								description: 'Property name.',
							},
							{
								displayName: 'Sub Type',
								name: 'subtype',
								type: 'string',
								default: '',
								description: 'Property sub type.',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Property value.',
							},
						],
					},
				],
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                                  company:delete                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'company ID',
		name: 'companyId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'company',
				],
				operation: [
					'delete',
				],
			},
		},
		default: '',
		description: 'ID of company to delete',
	},

	/* -------------------------------------------------------------------------- */
	/*                                company:update                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Company ID',
		name: 'companyId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'company',
				],
				operation: [
					'update',
				],
			},
		},
		default: '',
		description: 'Unique identifier for a particular company',
	},
	{
		displayName: 'JSON Parameters',
		name: 'jsonParameters',
		type: 'boolean',
		default: false,
		description: '',
		displayOptions: {
			show: {
				resource: [
					'company',
				],
				operation: [
					'update',
				],
			},
		},
	},
	{
		displayName: ' Additional Fields',
		name: 'additionalFieldsJson',
		type: 'json',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		default: '',
		displayOptions: {
			show: {
				resource: [
					'company',
				],
				operation: [
					'update',
				],
				jsonParameters: [
					true,
				],
			},
		},
		description: 'Object of values to set as described <a href="https://github.com/agilecrm/rest-api#1-companys---companies-api">here</a>.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [
					'company',
				],
				operation: [
					'update',
				],
				jsonParameters: [
					false,
				],
			},
		},
		options: [
			{
				displayName: 'Address',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Company address.',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Company email.',
			},
			{
				displayName: 'Star Value',
				name: 'starValue',
				type: 'options',
				default: '',
				description: 'Rating of company (Max value 5). This is not applicable for companies.',
				options: [
					{
						name: '0',
						value: 0,
					},
					{
						name: '1',
						value: 1,
					},
					{
						name: '2',
						value: 2,
					},
					{
						name: '3',
						value: 3,
					},
					{
						name: '4',
						value: 4,
					},
					{
						name: '5',
						value: 5,
					},
				],
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Tag',
				},
				default: [],
				description: 'Unique identifiers added to company, for easy management of companys. This is not applicable for companies.',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Company name.',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Company phone.',
			},
			{
				displayName: 'Website',
				name: 'websiteOptions',
				type: 'fixedCollection',
				description: 'Companys websites.',
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						displayName: 'Website properties.',
						name: 'websiteProperties',
						values: [
							{
								displayName: 'Type',
								name: 'subtype',
								type: 'options',
								required: true,
								default: '',
								description: 'Type of website.',
								options: [
									{
										name: 'Facebook',
										value: 'facebook',
									},
									{
										name: 'Feed',
										value: 'feed',
									},
									{
										name: 'Flickr',
										value: 'flickr',
									},
									{
										name: 'Github',
										value: 'github',
									},
									{
										name: 'Google Plus',
										value: 'googlePlus',
									},
									{
										name: 'LinkedIn',
										value: 'linkedin',
									},
									{
										name: 'Skype',
										value: 'skype',
									},
									{
										name: 'Twitter',
										value: 'twitter',
									},
									{
										name: 'URL',
										value: 'url',
									},
									{
										name: 'Xing',
										value: 'xing',
									},
									{
										name: 'YouTube',
										value: 'youtube',
									},
								],
							},
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								required: true,
								default: '',
								description: 'Website URL',
							},
						],
					},
				],
			},
			{
				displayName: 'Custom Properties',
				name: 'customProperties',
				type: 'fixedCollection',
				description: 'Custom Properties',
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						displayName: 'Property',
						name: 'customProperty',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								required: true,
								default: '',
								description: 'Property name.',
							},
							{
								displayName: 'Sub Type',
								name: 'subtype',
								type: 'string',
								default: '',
								description: 'Property sub type.',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Property value.',
							},
						],
					},
				],
			},
		],
	},

] as INodeProperties[];
