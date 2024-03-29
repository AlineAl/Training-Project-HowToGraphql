import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { FEED_QUERY } from './LinkList';
import { AUTH_TOKEN, LINKS_PER_PAGE } from '../constants';

const CREATE_LINK_MUTATION = gql`
    mutation PostMutation(
        $description: String!,
        $url: String!
    ) {
        post(description: $description, url: $url) {
            id
            createdAt
            description
            url
        }
    }
`;


const CreateLink = () => {
    const navigate = useNavigate();
    const [formState, setFormState] = useState({
        description: '',
        url: ''
    });
    const take = LINKS_PER_PAGE;
    const skip = 0;
    const orderBy = { createdAt: 'desc' }

    const [createLink] = useMutation(CREATE_LINK_MUTATION, {
        variables: {
          description: formState.description,
          url: formState.url
        },
        update: (cache, { data: { post } }) => {
            let data = {} as any
            data = cache.readQuery({
                query: FEED_QUERY,
                variables: {
                    take,
                    skip,
                    orderBy
                }
            });
    
          cache.writeQuery({
            query: FEED_QUERY,
            data: {
              feed: {
                links: [post, ...data.feed.links]
              }
            },
            variables: {
                take, 
                skip,
                orderBy
            }
          });
        },
        onCompleted: () => navigate("/")
      });

    return (
        <div>
            <form onSubmit={(e) => { e.preventDefault(); createLink();}}>
                <div className="flex flex-column mt3">
                    <input 
                        type="text" 
                        className="mb2" 
                        value={formState.description}
                        onChange={(e) => {
                            setFormState({
                                ...formState,
                                description: e.target.value 
                            })
                        }}
                        placeholder="A description for the link"
                    />
                    <input 
                        type="text" 
                        className="mb2"
                        value={formState.url}
                        onChange={(e) => {
                            setFormState({
                                ...formState,
                                url: e.target.value
                            })
                        }}
                        placeholder='The URL for the link'
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default CreateLink;