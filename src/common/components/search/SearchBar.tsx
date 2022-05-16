import React, { FC, useState, useRef, useEffect } from 'react';
import { Search } from '../icons/Search';
import LoadingSearchItem from './LoadingSearchItem';
import { useSearchLazyQuery, MetadataJson, Wallet } from 'src/graphql/indexerTypes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import SearchResults from './SearchResults';
import { useOutsideAlerter } from '@/common/hooks/useOutsideAlerter';
import { useRouter } from 'next/router';
import { Close } from '../icons/Close';
import { PublicKey } from '@solana/web3.js';

const schema = zod.object({
  query: zod.string().nonempty({ message: `Must enter something` }),
});

interface SearchQuerySchema {
  query: string;
}

export const isPublicKey = (address: string) => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

const SearchBar: FC = () => {
  const searchResultsRef = useRef<HTMLDivElement>(null!);

  const router = useRouter();

  const [showBar, setShowBar] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [hasSearch, setHasSearch] = useState(false);

  useEffect(() => {
    setShowResults(false);
  }, [router.route]);

  useOutsideAlerter(searchResultsRef, () => setShowResults(false));

  const toggleBar = () => {
    setShowBar(!showBar);
    setShowResults(false);
  };

  const [searchQuery, { data, loading, called }] = useSearchLazyQuery();

  const handleSearch = ({ query }: SearchQuerySchema) => {
    // handle enter
  };

  const handleOnChange = (e: any) => {
    if (e.target.value === '') {
      setHasSearch(false);
    } else {
      setHasSearch(true);
    }
    searchQuery({
      variables: {
        term: e.target.value,
        walletAddress: e.target.value,
      },
    });
  };

  const handleReset = () => {
    setValue('query', '');
    setShowResults(false);
  };

  const {
    handleSubmit,
    setValue,
    register,
    watch,
    formState: { isSubmitting },
  } = useForm<SearchQuerySchema>({
    resolver: zodResolver(schema),
  });

  const searchQueryWatchable = watch('query');

  return (
    <div
      id={`searchbar-container`}
      ref={searchResultsRef}
      className={`relative z-30 flex w-full flex-row items-center`}
    >
      {!showBar ? (
        <a
          onClick={toggleBar}
          className={`rounded-full p-2 transition ease-in-out hover:cursor-pointer hover:bg-gray-800`}
        >
          <Search />
        </a>
      ) : (
        <div
          className={`flex w-full flex-row items-center gap-2 rounded-full border border-white bg-gray-900 p-2`}
        >
          <a onClick={toggleBar}>
            <Search />
          </a>
          <form
            className={`relative flex w-full items-center`}
            onSubmit={handleSubmit(handleSearch)}
          >
            <input
              {...register('query', { required: true })}
              onFocus={() => setShowResults(true)}
              onChange={handleOnChange}
              placeholder={`Search Holaplex...`}
              className={`h-full w-full bg-gray-900 text-base text-gray-500`}
            />
            {hasSearch && (
              <button
                type={`button`}
                onClick={handleReset}
                className={`absolute top-0 right-2 hover:text-gray-400`}
              >
                <Close color={`#ffffff`} />
              </button>
            )}
          </form>
        </div>
      )}
      {showResults && (
        <div
          className={`h-content absolute top-12 z-50 max-h-96 w-full gap-6 overflow-y-auto rounded-lg bg-gray-900 p-6 transition ease-in-out`}
        >
          {loading && (
            <>
              <LoadingSearchItem />
              <LoadingSearchItem variant={`circle`} />
              <LoadingSearchItem />
              <LoadingSearchItem variant={`circle`} />
            </>
          )}
          {data && called && (
            <SearchResults
              results={data?.metadataJsons as MetadataJson[]}
              profileResults={data?.profiles as Wallet[]}
              walletResult={data.wallet as Wallet}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;