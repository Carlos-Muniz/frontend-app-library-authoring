import React from 'react';
import update from 'immutability-helper';
import { BrowserRouter } from 'react-router-dom';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { LibraryListPage } from '../LibraryListPage';
import { libraryListInitialState } from '../data';
import { LOADING_STATUS } from '../../common';
import { ctxMount } from '../../common/specs/helpers';

const InjectedLibraryListPage = injectIntl(LibraryListPage);

describe('list-libraries/LibraryListPage.jsx', () => {
  let props;
  let mockLibraryFetcher;

  beforeEach(() => {
    mockLibraryFetcher = jest.fn();
    props = {
      ...libraryListInitialState,
      fetchLibraryList: mockLibraryFetcher,
      status: LOADING_STATUS.LOADED,
    };
  });

  it('renders library list page without error', () => {
    ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...props} />
      </BrowserRouter>,
    );
  });

  it('fetches library list on mount', () => {
    ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...props} />
      </BrowserRouter>,
    );

    expect(mockLibraryFetcher).toHaveBeenCalledWith({
      params: {
        org: '',
        page: 1,
        page_size: 20,
        text_search: '',
        type: 'complex',
      },
    });
  });

  it('shows no pagination for empty library list', () => {
    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...props} />
      </BrowserRouter>,
    );

    expect(container.find('.library-list-pagination').length).toBe(0);
  });

  it('Paginates on big library list', () => {
    const newProps = update(props, {
      libraries: { count: { $set: 60 } },
    });

    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...newProps} />
      </BrowserRouter>,
    );

    const paginationContainer = container.find('.library-list-pagination').at(1);
    expect(paginationContainer).toBeTruthy();

    const previousButton = paginationContainer.find('.previous.page-link').at(1);
    expect(previousButton).toBeTruthy();

    const nextButton = paginationContainer.find('.next.page-link').at(1);
    expect(nextButton).toBeTruthy();

    nextButton.simulate('click');
    nextButton.simulate('click');
    previousButton.simulate('click');
    previousButton.simulate('click');

    const commonParams = {
      org: '', page_size: 20, text_search: '', type: 'complex',
    };
    expect(mockLibraryFetcher).toHaveBeenNthCalledWith(1, { params: { ...commonParams, page: 1 } });
    expect(mockLibraryFetcher).toHaveBeenNthCalledWith(2, { params: { ...commonParams, page: 2 } });
    expect(mockLibraryFetcher).toHaveBeenNthCalledWith(3, { params: { ...commonParams, page: 3 } });
    expect(mockLibraryFetcher).toHaveBeenNthCalledWith(4, { params: { ...commonParams, page: 2 } });
    expect(mockLibraryFetcher).toHaveBeenNthCalledWith(5, { params: { ...commonParams, page: 1 } });
  });
});
